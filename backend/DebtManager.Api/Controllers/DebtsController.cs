using Microsoft.AspNetCore.Mvc;
using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
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

    public DebtsController(ILogger<DebtsController> logger)
    {
        _logger = logger;
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
            // Implementação temporária para demonstração
            var mockDebts = new List<DebtTitleResponse>
            {
                new DebtTitleResponse
                {
                    Id = Guid.NewGuid(),
                    OriginalValue = 1000.00m,
                    UpdatedValue = 1050.00m,
                    DueDate = DateTime.Now.AddDays(-10),
                    InterestRatePerDay = 0.1m,
                    DebtorName = "João Silva",
                    DebtorDocument = "123.456.789-00",
                    CreatedAt = DateTime.Now.AddDays(-30)
                }
            };

            return Ok(mockDebts);
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
            // Implementação temporária
            if (id == Guid.Empty)
                return BadRequest("ID inválido");

            // Mock data
            var mockDebt = new DebtTitleResponse
            {
                Id = id,
                OriginalValue = 1000.00m,
                UpdatedValue = 1050.00m,
                DueDate = DateTime.Now.AddDays(-10),
                InterestRatePerDay = 0.1m,
                DebtorName = "João Silva",
                DebtorDocument = "123.456.789-00",
                CreatedAt = DateTime.Now.AddDays(-30)
            };

            return Ok(mockDebt);
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

            // Implementação temporária
            var createdDebt = new DebtTitleResponse
            {
                Id = Guid.NewGuid(),
                OriginalValue = request.OriginalValue,
                UpdatedValue = request.OriginalValue, // Sem juros ainda
                DueDate = request.DueDate,
                InterestRatePerDay = request.InterestRatePerDay,
                DebtorName = request.DebtorName,
                DebtorDocument = request.DebtorDocument,
                CreatedAt = DateTime.UtcNow
            };

            return CreatedAtAction(nameof(GetDebtById), new { id = createdDebt.Id }, createdDebt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar título de dívida");
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}

/// <summary>
/// Dados para criação de um título de dívida
/// </summary>
public class CreateDebtTitleRequest
{
    /// <summary>
    /// Valor original do título
    /// </summary>
    /// <example>1000.00</example>
    [Required(ErrorMessage = "Valor original é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal OriginalValue { get; set; }

    /// <summary>
    /// Data de vencimento
    /// </summary>
    /// <example>2024-12-31</example>
    [Required(ErrorMessage = "Data de vencimento é obrigatória")]
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Taxa de juros por dia (em porcentagem)
    /// </summary>
    /// <example>0.1</example>
    [Required(ErrorMessage = "Taxa de juros é obrigatória")]
    [Range(0, 100, ErrorMessage = "Taxa deve estar entre 0 e 100")]
    public decimal InterestRatePerDay { get; set; }

    /// <summary>
    /// Nome do devedor
    /// </summary>
    /// <example>João Silva</example>
    [Required(ErrorMessage = "Nome do devedor é obrigatório")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 200 caracteres")]
    public string DebtorName { get; set; } = string.Empty;

    /// <summary>
    /// Documento do devedor (CPF ou CNPJ)
    /// </summary>
    /// <example>123.456.789-00</example>
    [Required(ErrorMessage = "Documento do devedor é obrigatório")]
    public string DebtorDocument { get; set; } = string.Empty;
}

/// <summary>
/// Resposta com dados do título de dívida
/// </summary>
public class DebtTitleResponse
{
    /// <summary>
    /// ID único do título
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Valor original do título
    /// </summary>
    public decimal OriginalValue { get; set; }

    /// <summary>
    /// Valor atualizado com juros
    /// </summary>
    public decimal UpdatedValue { get; set; }

    /// <summary>
    /// Data de vencimento
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Taxa de juros por dia
    /// </summary>
    public decimal InterestRatePerDay { get; set; }

    /// <summary>
    /// Nome do devedor
    /// </summary>
    public string DebtorName { get; set; } = string.Empty;

    /// <summary>
    /// Documento do devedor
    /// </summary>
    public string DebtorDocument { get; set; } = string.Empty;

    /// <summary>
    /// Data de criação
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Indica se o título está em atraso
    /// </summary>
    public bool IsOverdue => DateTime.Now.Date > DueDate.Date;

    /// <summary>
    /// Dias em atraso
    /// </summary>
    public int DaysOverdue => IsOverdue ? (DateTime.Now.Date - DueDate.Date).Days : 0;
}