using DebtManager.Core.Application.DTOs;

namespace DebtManager.Core.Application.Interfaces;

public interface IRequestMappingService
{
    CreateDebtTitleDto MapToCreateDto(CreateDebtTitleRequest request);
    UpdateDebtTitleDto MapToUpdateDto(UpdateDebtTitleRequest request);
}