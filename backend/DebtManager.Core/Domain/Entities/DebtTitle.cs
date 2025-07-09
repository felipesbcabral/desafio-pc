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
        TitleNumber = titleNumber;
        OriginalValue = originalValue;
        DueDate = dueDate;
        InterestRatePerDay = interestRatePerDay;
        PenaltyRate = penaltyRate;
        Debtor = debtor;
        CreatedAt = DateTime.UtcNow;
    }
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
        TitleNumber = titleNumber;
        OriginalValue = originalValue;
        DueDate = dueDate;
        InterestRatePerDay = interestRatePerDay;
        PenaltyRate = penaltyRate;
        Debtor = new Debtor(debtorName, debtorDocument);
        CreatedAt = DateTime.UtcNow;
    }

    public decimal CalculateUpdatedValue()
    {
        // Se há parcelas, calcula baseado nas parcelas individuais
        if(Installments.Count!=0)
        {
            var totalInterest = 0m;
            var totalOriginalValue = 0m;
            var hasOverdueInstallments = false;

            foreach (var installment in Installments)
            {
                totalOriginalValue += installment.Value;
                // Usando a taxa de juros mensal (InterestRatePerDay * 30) para o cálculo correto
                var monthlyInterestRate = InterestRatePerDay * 30;
                totalInterest += installment.CalculateInterest(monthlyInterestRate);
                
                // Verifica se há pelo menos uma parcela em atraso
                if (installment.IsOverdue())
                {
                    hasOverdueInstallments = true;
                }
            }

            // Aplica multa uma única vez sobre o valor original total se houver parcelas em atraso
            // PenaltyRate já vem como decimal (ex: 0.02 para 2%), não precisa dividir por 100
            var totalPenalty = hasOverdueInstallments ? totalOriginalValue * PenaltyRate : 0m;

            return totalOriginalValue + totalInterest + totalPenalty;
        }
        
        var daysPastDue = (DateTime.Now.Date - DueDate.Date).Days;
        if (daysPastDue <= 0)
            return OriginalValue;

        var interest = OriginalValue * InterestRatePerDay * daysPastDue;
        var penalty = OriginalValue * PenaltyRate;
        return OriginalValue + interest + penalty;
    }

    public void AddInstallment(int installmentNumber, decimal value, DateTime dueDate)
    {
        var installment = new Installment(Id, installmentNumber, value, dueDate);
        Installments.Add(installment);
    }

    public void UpdateInterestRate(decimal newInterestRate)
    {
        InterestRatePerDay = newInterestRate;
    }

    public void UpdatePenaltyRate(decimal newPenaltyRate)
    {
        PenaltyRate = newPenaltyRate;
    }

    public void UpdateDebtor(string debtorName, string? debtorDocument)
    {
        if (string.IsNullOrWhiteSpace(debtorDocument))
            debtorDocument = Debtor?.Document?.Value ?? string.Empty;
        
        Debtor = new Debtor(debtorName, debtorDocument);
    }

    public void UpdateTitleNumber(string titleNumber)
    {
        TitleNumber = titleNumber;
    }

    public void UpdateOriginalValue(decimal originalValue)
    {
        OriginalValue = originalValue;
    }

    public void UpdateDueDate(DateTime dueDate)
    {
        DueDate = dueDate;
    }

    public void UpdateComplete(string titleNumber, decimal originalValue, DateTime dueDate, decimal interestRatePerDay, decimal penaltyRate, string debtorName, string? debtorDocument)
    {
        UpdateTitleNumber(titleNumber);
        UpdateOriginalValue(originalValue);
        UpdateDueDate(dueDate);
        UpdateInterestRate(interestRatePerDay);
        UpdatePenaltyRate(penaltyRate);
        UpdateDebtor(debtorName, debtorDocument);
    }
}