using System;
using DebtManager.Core.Domain.ValueObjects;

namespace DebtManager.Core.Domain.Entities;

public class DebtTitle
{
    public Guid Id { get; private set; }
    public string TitleNumber { get; private set; } = null!;
    public decimal OriginalValue { get; private set; }
    public DateTime DueDate { get; private set; }
    public decimal InterestRatePerDay { get; private set; }
    public decimal PenaltyRate { get; private set; }
    public Debtor Debtor { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public List<Installment> Installments { get; private set; } = [];

    // Propriedades removidas - agora usando OwnsOne para mapear o Value Object Debtor

    // Construtor privado para EF Core
    private DebtTitle() { }

    public DebtTitle(
        string titleNumber,
        decimal originalValue,
        DateTime dueDate,
        decimal interestRatePerDay,
        decimal penaltyRate,
        Debtor debtor)
    {
        Id = Guid.NewGuid();
        TitleNumber = titleNumber ?? throw new ArgumentNullException(nameof(titleNumber));
        OriginalValue = originalValue;
        DueDate = dueDate;
        InterestRatePerDay = interestRatePerDay;
        PenaltyRate = penaltyRate;
        Debtor = debtor ?? throw new ArgumentNullException(nameof(debtor));
        CreatedAt = DateTime.UtcNow;

        ValidateEntity();
    }

    // Construtor alternativo para compatibilidade
    public DebtTitle(
        string titleNumber,
        decimal originalValue,
        DateTime dueDate,
        decimal interestRatePerDay,
        decimal penaltyRate,
        string debtorName,
        string debtorDocument)
    {
        Id = Guid.NewGuid();
        TitleNumber = titleNumber ?? throw new ArgumentNullException(nameof(titleNumber));
        OriginalValue = originalValue;
        DueDate = dueDate;
        InterestRatePerDay = interestRatePerDay;
        PenaltyRate = penaltyRate;
        Debtor = new Debtor(debtorName, debtorDocument);
        CreatedAt = DateTime.UtcNow;

        ValidateEntity();
    }

    public decimal CalculateUpdatedValue()
    {
        var daysPastDue = (DateTime.Now.Date - DueDate.Date).Days;
        if (daysPastDue <= 0)
            return OriginalValue;

        var interest = OriginalValue * (InterestRatePerDay / 100) * daysPastDue;
        var penalty = OriginalValue * (PenaltyRate / 100);
        return OriginalValue + interest + penalty;
    }

    public void AddInstallment(int installmentNumber, decimal value, DateTime dueDate)
    {
        var installment = new Installment(Id, installmentNumber, value, dueDate);
        Installments.Add(installment);
    }

    private void ValidateEntity()
    {
        if (string.IsNullOrWhiteSpace(TitleNumber))
            throw new ArgumentException("O número do título é obrigatório.");

        if (OriginalValue <= 0)
            throw new ArgumentException("O valor original deve ser maior que zero.");

        if (InterestRatePerDay < 0)
            throw new ArgumentException("A taxa de juros não pode ser negativa.");

        if (PenaltyRate < 0)
            throw new ArgumentException("A taxa de multa não pode ser negativa.");

        if (Debtor == null)
            throw new ArgumentException("O devedor é obrigatório.");
    }
}