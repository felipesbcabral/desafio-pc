namespace DebtManager.Core.Application.DTOs;

/// <summary>
/// DTO para atualização de título de dívida
/// </summary>
public class UpdateDebtTitleDto
{
    public string TitleNumber { get; set; } = null!;
    public decimal OriginalValue { get; set; }
    public DateTime DueDate { get; set; }
    public decimal InterestRatePerDay { get; set; }
    public decimal PenaltyRate { get; set; }
    public string DebtorName { get; set; } = null!;
    public string DebtorDocument { get; set; } = null!;
}