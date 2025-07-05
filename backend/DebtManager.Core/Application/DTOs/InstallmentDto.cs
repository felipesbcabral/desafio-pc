namespace DebtManager.Core.Application.DTOs;

public class InstallmentDto
{
    public int InstallmentNumber { get; set; }
    public decimal Value { get; set; }
    public DateTime DueDate { get; set; }
}