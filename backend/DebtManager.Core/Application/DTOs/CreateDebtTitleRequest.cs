using System.ComponentModel.DataAnnotations;

namespace DebtManager.Core.Application.DTOs;

public class CreateDebtTitleRequest
{
    [Required(ErrorMessage = "Número do título é obrigatório")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Número do título deve ter entre 1 e 50 caracteres")]
    public string TitleNumber { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal? OriginalValue { get; set; }

    [Required(ErrorMessage = "Data de vencimento é obrigatória")]
    public DateTime DueDate { get; set; }

    [Required(ErrorMessage = "Taxa de juros é obrigatória")]
    [Range(0, 100, ErrorMessage = "Taxa deve estar entre 0 e 100")]
    public decimal InterestRatePerDay { get; set; }

    [Required(ErrorMessage = "Taxa de multa é obrigatória")]
    [Range(0, 100, ErrorMessage = "Taxa de multa deve estar entre 0 e 100")]
    public decimal PenaltyRate { get; set; }

    [Required(ErrorMessage = "Nome do devedor é obrigatório")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 200 caracteres")]
    public string DebtorName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Documento do devedor é obrigatório")]
    public string DebtorDocument { get; set; } = string.Empty;

    [Required(ErrorMessage = "Pelo menos uma parcela é obrigatória")]
    [MinLength(1, ErrorMessage = "Deve haver pelo menos uma parcela")]
    public List<InstallmentRequest> Installments { get; set; } = new();
}