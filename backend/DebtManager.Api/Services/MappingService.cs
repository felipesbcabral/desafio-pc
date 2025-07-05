using DebtManager.Api.DTOs;
using DebtManager.Core.Domain.Entities;

namespace DebtManager.Api.Services;

public class MappingService
{
    public DebtTitleResponse MapToResponse(DebtTitle debtTitle)
    {
        var monthlyInterestRate = debtTitle.InterestRatePerDay * 30;
        
        var installments = debtTitle.Installments.Select(i => new InstallmentResponse
        {
            Id = i.Id,
            InstallmentNumber = i.InstallmentNumber,
            Value = i.Value,
            DueDate = i.DueDate,
            IsPaid = i.IsPaid,
            PaidAt = i.PaidAt,
            IsOverdue = i.IsOverdue(),
            DaysOverdue = i.IsOverdue() ? (DateTime.Now.Date - i.DueDate.Date).Days : 0,
            InterestAmount = i.CalculateInterest(monthlyInterestRate),
            UpdatedValue = i.CalculateUpdatedValue(monthlyInterestRate, debtTitle.PenaltyRate)
        }).ToList();

        var titleDaysOverdue = DateTime.Now.Date > debtTitle.DueDate.Date ? 
            (DateTime.Now.Date - debtTitle.DueDate.Date).Days : 0;
        
        var installmentMaxDaysOverdue = installments.Count!=0 ? installments.Max(i => i.DaysOverdue) : 0;
        var maxDaysOverdue = Math.Max(titleDaysOverdue, installmentMaxDaysOverdue);

        return new DebtTitleResponse
        {
            Id = debtTitle.Id,
            TitleNumber = debtTitle.TitleNumber,
            OriginalValue = debtTitle.OriginalValue,
            UpdatedValue = debtTitle.CalculateUpdatedValue(),
            DueDate = debtTitle.DueDate,
            InterestRatePerDay = debtTitle.InterestRatePerDay,
            PenaltyRate = debtTitle.PenaltyRate,
            DebtorName = debtTitle.Debtor.Name,
            DebtorDocument = debtTitle.Debtor.Document.Value,
            DebtorDocumentType = debtTitle.Debtor.Document.Type.ToString(),
            CreatedAt = debtTitle.CreatedAt,
            InstallmentCount = installments.Count,
            DaysOverdue = maxDaysOverdue,
            Installments = installments
        };
    }
}