using System.ComponentModel.DataAnnotations;

namespace DebtManager.Api.DTOs;

/// <summary>
/// DTO para requisição de atualização de título de dívida
/// </summary>
public class UpdateDebtTitleRequest
{
    /// <summary>
    /// Número do título
    /// </summary>
    [Required(ErrorMessage = "Número do título é obrigatório")]
    [StringLength(50, ErrorMessage = "Número do título deve ter no máximo 50 caracteres")]
    public string TitleNumber { get; set; } = null!;

    /// <summary>
    /// Valor original do título
    /// </summary>
    [Required(ErrorMessage = "Valor original é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor original deve ser maior que zero")]
    public decimal OriginalValue { get; set; }

    /// <summary>
    /// Data de vencimento
    /// </summary>
    [Required(ErrorMessage = "Data de vencimento é obrigatória")]
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Taxa de juros por dia (decimal entre 0 e 1)
    /// </summary>
    [Required(ErrorMessage = "Taxa de juros é obrigatória")]
    [Range(0, 1, ErrorMessage = "Taxa de juros deve estar entre 0 e 1")]
    public decimal InterestRatePerDay { get; set; }

    /// <summary>
    /// Taxa de multa (decimal entre 0 e 1)
    /// </summary>
    [Required(ErrorMessage = "Taxa de multa é obrigatória")]
    [Range(0, 1, ErrorMessage = "Taxa de multa deve estar entre 0 e 1")]
    public decimal PenaltyRate { get; set; }

    /// <summary>
    /// Nome do devedor
    /// </summary>
    [Required(ErrorMessage = "Nome do devedor é obrigatório")]
    [StringLength(200, ErrorMessage = "Nome do devedor deve ter no máximo 200 caracteres")]
    public string DebtorName { get; set; } = null!;

    /// <summary>
    /// Documento do devedor (CPF ou CNPJ)
    /// </summary>
    [StringLength(18, ErrorMessage = "Documento deve ter no máximo 18 caracteres")]
    public string? DebtorDocument { get; set; }
}