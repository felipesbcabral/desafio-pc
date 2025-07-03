using Microsoft.AspNetCore.Mvc;
using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
using DebtManager.Api.DTOs;
using System.ComponentModel.DataAnnotations;

namespace DebtManager.Api.Controllers;

/// <summary>
/// Controller para gestão de parcelas
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class InstallmentsController : ControllerBase
{
    private readonly ILogger<InstallmentsController> _logger;
    private readonly InstallmentService _installmentService;
    private readonly DebtTitleService _debtTitleService;

    public InstallmentsController(
        ILogger<InstallmentsController> logger, 
        InstallmentService installmentService,
        DebtTitleService debtTitleService)
    {
        _logger = logger;
        _installmentService = installmentService;
        _debtTitleService = debtTitleService;
    }

    /// <summary>
    /// Obtém todas as parcelas de um título específico
    /// </summary>
    /// <param name="debtTitleId">ID do título de dívida</param>
    /// <returns>Lista de parcelas do título</returns>
    /// <response code="200">Retorna a lista de parcelas</response>
    /// <response code="404">Título não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("debt/{debtTitleId:guid}")]
    [ProducesResponseType(typeof(IEnumerable<InstallmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<InstallmentResponse>>> GetInstallmentsByDebtTitle(Guid debtTitleId)
    {
        try
        {
            var debtTitle = await _debtTitleService.GetByIdAsync(debtTitleId);
            if (debtTitle == null)
                return NotFound($"Título de dívida com ID {debtTitleId} não encontrado");

            var installments = debtTitle.Installments.Select(i => MapToResponse(i, debtTitle));
            return Ok(installments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar parcelas do título {DebtTitleId}", debtTitleId);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém uma parcela específica
    /// </summary>
    /// <param name="id">ID da parcela</param>
    /// <returns>Parcela encontrada</returns>
    /// <response code="200">Retorna a parcela encontrada</response>
    /// <response code="404">Parcela não encontrada</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(InstallmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InstallmentResponse>> GetInstallmentById(Guid id)
    {
        try
        {
            var installment = await _installmentService.GetByIdAsync(id);
            if (installment == null)
                return NotFound($"Parcela com ID {id} não encontrada");

            var debtTitle = await _debtTitleService.GetByIdAsync(installment.DebtTitleId);
            if (debtTitle == null)
                return NotFound("Título de dívida associado não encontrado");

            var response = MapToResponse(installment, debtTitle);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar parcela {Id}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Marca uma parcela como paga
    /// </summary>
    /// <param name="id">ID da parcela</param>
    /// <returns>Parcela atualizada</returns>
    /// <response code="200">Parcela marcada como paga com sucesso</response>
    /// <response code="400">Parcela já está paga</response>
    /// <response code="404">Parcela não encontrada</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPatch("{id:guid}/mark-as-paid")]
    [ProducesResponseType(typeof(InstallmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InstallmentResponse>> MarkAsPaid(Guid id)
    {
        try
        {
            var installment = await _installmentService.MarkAsPaidAsync(id);
            if (installment == null)
                return NotFound($"Parcela com ID {id} não encontrada");

            var debtTitle = await _debtTitleService.GetByIdAsync(installment.DebtTitleId);
            if (debtTitle == null)
                return NotFound("Título de dívida associado não encontrado");

            var response = MapToResponse(installment, debtTitle);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Tentativa de marcar parcela já paga como paga: {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao marcar parcela como paga {Id}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Marca uma parcela como não paga
    /// </summary>
    /// <param name="id">ID da parcela</param>
    /// <returns>Parcela atualizada</returns>
    /// <response code="200">Parcela marcada como não paga com sucesso</response>
    /// <response code="404">Parcela não encontrada</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPatch("{id:guid}/mark-as-unpaid")]
    [ProducesResponseType(typeof(InstallmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InstallmentResponse>> MarkAsUnpaid(Guid id)
    {
        try
        {
            var installment = await _installmentService.MarkAsUnpaidAsync(id);
            if (installment == null)
                return NotFound($"Parcela com ID {id} não encontrada");

            var debtTitle = await _debtTitleService.GetByIdAsync(installment.DebtTitleId);
            if (debtTitle == null)
                return NotFound("Título de dívida associado não encontrado");

            var response = MapToResponse(installment, debtTitle);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao marcar parcela como não paga {Id}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém todas as parcelas em atraso
    /// </summary>
    /// <returns>Lista de parcelas em atraso</returns>
    /// <response code="200">Retorna a lista de parcelas em atraso</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(IEnumerable<InstallmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<InstallmentResponse>>> GetOverdueInstallments()
    {
        try
        {
            var overdueInstallments = await _installmentService.GetOverdueInstallmentsAsync();
            var response = new List<InstallmentResponse>();

            foreach (var installment in overdueInstallments)
            {
                var debtTitle = await _debtTitleService.GetByIdAsync(installment.DebtTitleId);
                if (debtTitle != null)
                {
                    response.Add(MapToResponse(installment, debtTitle));
                }
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar parcelas em atraso");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    private InstallmentResponse MapToResponse(Installment installment, DebtTitle debtTitle)
    {
        // Usando a taxa de juros mensal (InterestRatePerDay * 30) para o cálculo correto
        var monthlyInterestRate = debtTitle.InterestRatePerDay * 30;
        
        return new InstallmentResponse
        {
            Id = installment.Id,
            InstallmentNumber = installment.InstallmentNumber,
            Value = installment.Value,
            DueDate = installment.DueDate,
            IsPaid = installment.IsPaid,
            PaidAt = installment.PaidAt,
            IsOverdue = installment.IsOverdue(),
            DaysOverdue = installment.IsOverdue() ? (DateTime.Now.Date - installment.DueDate.Date).Days : 0,
            InterestAmount = installment.CalculateInterest(monthlyInterestRate),
            UpdatedValue = installment.CalculateUpdatedValue(monthlyInterestRate, debtTitle.PenaltyRate)
        };
    }
}