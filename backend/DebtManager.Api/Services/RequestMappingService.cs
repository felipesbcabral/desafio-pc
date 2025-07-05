using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Application.Interfaces;

namespace DebtManager.Api.Services;

public class RequestMappingService : IRequestMappingService
{
    public CreateDebtTitleDto MapToCreateDto(CreateDebtTitleRequest request)
    {
        return new CreateDebtTitleDto
        {
            TitleNumber = request.TitleNumber,
            OriginalValue = request.OriginalValue,
            InterestRatePerDay = request.InterestRatePerDay,
            PenaltyRate = request.PenaltyRate,
            DebtorName = request.DebtorName,
            DebtorDocument = request.DebtorDocument,
            Installments = [.. request.Installments.Select(i => new InstallmentDto
            {
                InstallmentNumber = i.InstallmentNumber,
                Value = i.Value,
                DueDate = i.DueDate
            })]
        };
    }

    public UpdateDebtTitleDto MapToUpdateDto(UpdateDebtTitleRequest request)
    {
        return new UpdateDebtTitleDto
        {
            TitleNumber = request.TitleNumber,
            OriginalValue = request.OriginalValue,
            DueDate = request.DueDate,
            InterestRatePerDay = request.InterestRatePerDay,
            PenaltyRate = request.PenaltyRate,
            DebtorName = request.DebtorName,
            DebtorDocument = request.DebtorDocument
        };
    }
}