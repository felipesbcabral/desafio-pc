using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Application.Common;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Interfaces;

public interface IDebtTitleService
{
    Task<Result<DebtTitle>> GetByIdAsync(Guid id);
    Task<Result<IEnumerable<DebtTitle>>> GetAllAsync();
    Task<Result<IEnumerable<DebtTitle>>> GetByDebtorDocumentAsync(string debtorDocument);
    Task<Result<DebtTitle>> CreateDebtTitleAsync(CreateDebtTitleDto dto);
    Task<Result<DebtTitle>> UpdateDebtTitleAsync(Guid id, UpdateDebtTitleDto updateDto);
    Task<Result<bool>> DeleteAsync(Guid id);
    Task<decimal> GetTotalDebtValueAsync();

    Task<Result<DebtTitle>> CreateFromRequestAsync(CreateDebtTitleRequest request);
    Task<Result<DebtTitle>> UpdateFromRequestAsync(Guid id, UpdateDebtTitleRequest request);
}