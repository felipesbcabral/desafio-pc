namespace DebtManager.Core.Application.DTOs;

public class CreateDebtTitleDto
{
    public string TitleNumber { get; set; } = string.Empty;
    public decimal? OriginalValue { get; set; }
    public decimal InterestRatePerDay { get; set; }
    public decimal PenaltyRate { get; set; }
    public string DebtorName { get; set; } = string.Empty;
    public string DebtorDocument { get; set; } = string.Empty;
    public List<InstallmentDto> Installments { get; set; } = [];
}