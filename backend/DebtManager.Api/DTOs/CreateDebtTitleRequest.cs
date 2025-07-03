using System.ComponentModel.DataAnnotations;

namespace DebtManager.Api.DTOs;

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
    /// <example>12345678901</example>
    [Required(ErrorMessage = "Documento do devedor é obrigatório")]
    public string DebtorDocument { get; set; } = string.Empty;
}