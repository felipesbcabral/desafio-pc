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

    // Propriedade de navegação
    public DebtTitle DebtTitle { get; private set; } = null!;

    // Construtor privado para EF Core
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

        ValidateInstallment();
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

        // Fórmula correta: (Taxa Juros / 30) × Dias Atraso × Valor da Parcela
        return (monthlyInterestRate / 30) * daysOverdue * Value;
    }

    public decimal CalculateUpdatedValue(decimal monthlyInterestRate, decimal penaltyRate)
    {
        var interest = CalculateInterest(monthlyInterestRate);
        var penalty = IsOverdue() ? Value * (penaltyRate / 100) : 0;
        return Value + interest + penalty;
    }

    private void ValidateInstallment()
    {
        if (InstallmentNumber <= 0)
            throw new ArgumentException("O número da parcela deve ser maior que zero.");

        if (Value <= 0)
            throw new ArgumentException("O valor da parcela deve ser maior que zero.");

        if (DebtTitleId == Guid.Empty)
            throw new ArgumentException("O ID do título de dívida é obrigatório.");
    }
}