using System;

namespace DebtManager.Core.Domain.Entities;

public class Installment
{
    public Guid Id { get; private set; }
    public Guid DebtTitleId { get; private set; }
    public int InstallmentNumber { get; private set; }
    public decimal Value { get; private set; }
    public DateTime DueDate { get; private set; }
    public bool IsPaid { get; private set; }
    public DateTime? PaidAt { get; private set; }

    public DebtTitle DebtTitle { get; private set; } = null!;

    private Installment() { }

    public Installment(
        Guid debtTitleId,
        int installmentNumber,
        decimal value,
        DateTime dueDate)
    {
        Id = Guid.NewGuid();
        DebtTitleId = debtTitleId;
        InstallmentNumber = installmentNumber;
        Value = value;
        DueDate = dueDate;
        IsPaid = false;
    }

    public void MarkAsPaid()
    {
        if (IsPaid)
            throw new InvalidOperationException("Esta parcela já foi paga.");

        IsPaid = true;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkAsUnpaid()
    {
        IsPaid = false;
        PaidAt = null;
    }

    public bool IsOverdue()
    {
        return !IsPaid && DateTime.Now.Date > DueDate.Date;
    }

    public int GetDaysOverdue()
    {
        if (!IsOverdue())
            return 0;

        return (DateTime.Now.Date - DueDate.Date).Days;
    }

    public decimal CalculateInterest(decimal monthlyInterestRate)
    {
        var daysOverdue = GetDaysOverdue();
        if (daysOverdue <= 0)
            return 0;

        // Fórmula (Taxa Juros Mensal / 30) × Dias Atraso × Valor da Parcela
        // monthlyInterestRate já vem como taxa mensal (ex: 0.01 para 1%)
        return (monthlyInterestRate / 30) * daysOverdue * Value;
    }

    public decimal CalculateUpdatedValue(decimal monthlyInterestRate, decimal penaltyRate)
    {
        var interest = CalculateInterest(monthlyInterestRate);
        // penaltyRate já vem como decimal (ex: 0.02 para 2%), não precisa dividir por 100
        var penalty = IsOverdue() ? Value * penaltyRate : 0;
        return Value + interest + penalty;
    }
}