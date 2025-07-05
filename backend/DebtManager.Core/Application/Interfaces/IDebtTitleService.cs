using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Interfaces;

public interface IDebtTitleService
{
    Task<DebtTitle> GetByIdAsync(Guid id);
    Task<IEnumerable<DebtTitle>> GetAllAsync();
    Task<IEnumerable<DebtTitle>> GetByDebtorDocumentAsync(string debtorDocument);
    Task<DebtTitle> CreateDebtTitleAsync(CreateDebtTitleDto dto);
    Task<DebtTitle> UpdateDebtTitleAsync(Guid id, UpdateDebtTitleDto updateDto);
    Task<bool> DeleteAsync(Guid id);
    Task<decimal> GetTotalDebtValueAsync();

    Task<DebtTitle> CreateFromRequestAsync(CreateDebtTitleRequest request);
    Task<DebtTitle> UpdateFromRequestAsync(Guid id, UpdateDebtTitleRequest request);
}