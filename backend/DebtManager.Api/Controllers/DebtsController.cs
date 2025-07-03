using Microsoft.AspNetCore.Mvc;
using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
using DebtManager.Api.DTOs;
using System.ComponentModel.DataAnnotations;

namespace DebtManager.Api.Controllers;

/// <summary>
/// Controller para gestão de títulos de dívida
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DebtsController : ControllerBase
{
    private readonly ILogger<DebtsController> _logger;
    private readonly DebtTitleService _debtTitleService;

    public DebtsController(ILogger<DebtsController> logger, DebtTitleService debtTitleService)
    {
        _logger = logger;
        _debtTitleService = debtTitleService;
    }

    /// <summary>
    /// Obtém todos os títulos de dívida
    /// </summary>
    /// <returns>Lista de títulos de dívida</returns>
    /// <response code="200">Retorna a lista de títulos</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DebtTitleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DebtTitleResponse>>> GetAllDebts()
    {
        try
        {
            var debtTitles = await _debtTitleService.GetAllDebtTitlesAsync();
            var response = debtTitles.Select(MapToResponse);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar títulos de dívida");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém um título de dívida específico
    /// </summary>
    /// <param name="id">ID do título de dívida</param>
    /// <returns>Título de dívida</returns>
    /// <response code="200">Retorna o título encontrado</response>
    /// <response code="404">Título não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DebtTitleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DebtTitleResponse>> GetDebtById(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
                return BadRequest("ID inválido");

            var debtTitle = await _debtTitleService.GetByIdAsync(id);
            if (debtTitle == null)
                return NotFound($"Título de dívida com ID {id} não encontrado");

            var response = MapToResponse(debtTitle);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar título de dívida {Id}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria um novo título de dívida
    /// </summary>
    /// <param name="request">Dados do título a ser criado</param>
    /// <returns>Título criado</returns>
    /// <response code="201">Título criado com sucesso</response>
    /// <response code="400">Dados inválidos</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost]
    [ProducesResponseType(typeof(DebtTitleResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DebtTitleResponse>> CreateDebt([FromBody] CreateDebtTitleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            DebtTitle createdDebt;
            
            // Se há parcelas customizadas, usa o método específico
            if (request.Installments.Any())
            {
                var installments = request.Installments.Select(i => (i.InstallmentNumber, i.Value, i.DueDate)).ToList();
                createdDebt = await _debtTitleService.CreateDebtTitleWithCustomInstallmentsAsync(
                    request.TitleNumber,
                    request.InterestRatePerDay,
                    request.PenaltyRate,
                    request.DebtorName,
                    request.DebtorDocument,
                    installments,
                    request.OriginalValue);
            }
            else
            {
                // Fallback para o método original (compatibilidade)
                if (!request.OriginalValue.HasValue)
                    return BadRequest("Valor original é obrigatório quando não há parcelas especificadas.");
                    
                createdDebt = await _debtTitleService.CreateDebtTitleAsync(
                    request.TitleNumber,
                    request.OriginalValue.Value,
                    request.DueDate,
                    request.InterestRatePerDay,
                    request.PenaltyRate,
                    request.DebtorName,
                    request.DebtorDocument);
            }

            var response = MapToResponse(createdDebt);

            return CreatedAtAction(nameof(GetDebtById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Dados inválidos ao criar título de dívida: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro interno ao criar título de dívida");
            return StatusCode(500, new { error = "Erro interno do servidor" });
        }
    }

    private DebtTitleResponse MapToResponse(DebtTitle debtTitle)
    {
        // Usando a taxa de juros mensal (InterestRatePerDay * 30) para o cálculo correto
        var monthlyInterestRate = debtTitle.InterestRatePerDay * 30;
        
        var installments = debtTitle.Installments.Select(i => new InstallmentResponse
        {
            Id = i.Id,
            InstallmentNumber = i.InstallmentNumber,
            Value = i.Value,
            DueDate = i.DueDate,
            IsPaid = i.IsPaid,
            PaidAt = i.PaidAt,
            IsOverdue = i.IsOverdue(),
            DaysOverdue = i.IsOverdue() ? (DateTime.Now.Date - i.DueDate.Date).Days : 0,
            InterestAmount = i.CalculateInterest(monthlyInterestRate),
            UpdatedValue = i.CalculateUpdatedValue(monthlyInterestRate, debtTitle.PenaltyRate)
        }).ToList();

        var maxDaysOverdue = installments.Any() ? installments.Max(i => i.DaysOverdue) : 
            (DateTime.Now.Date > debtTitle.DueDate.Date ? (DateTime.Now.Date - debtTitle.DueDate.Date).Days : 0);

        return new DebtTitleResponse
        {
            Id = debtTitle.Id,
            TitleNumber = debtTitle.TitleNumber,
            OriginalValue = debtTitle.OriginalValue,
            UpdatedValue = debtTitle.CalculateUpdatedValue(),
            DueDate = debtTitle.DueDate,
            InterestRatePerDay = debtTitle.InterestRatePerDay,
            PenaltyRate = debtTitle.PenaltyRate,
            DebtorName = debtTitle.Debtor.Name,
            DebtorDocument = debtTitle.Debtor.Document.Value,
            DebtorDocumentType = debtTitle.Debtor.Document.Type.ToString(),
            CreatedAt = debtTitle.CreatedAt,
            InstallmentCount = installments.Count,
            DaysOverdue = maxDaysOverdue,
            Installments = installments
        };
    }
}