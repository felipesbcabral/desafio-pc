using System;

namespace DebtManager.Api.DTOs;

public class InstallmentResponse
{
    public Guid Id { get; set; }
    public int InstallmentNumber { get; set; }
    public decimal Value { get; set; }
    public DateTime DueDate { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public bool IsOverdue { get; set; }
    public int DaysOverdue { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal UpdatedValue { get; set; }
}