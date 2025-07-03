using DebtManager.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Domain.Repositories;

public interface IInstallmentRepository
{
    Task<Installment?> GetByIdAsync(Guid id);
    Task<IEnumerable<Installment>> GetByDebtTitleIdAsync(Guid debtTitleId);
    Task<IEnumerable<Installment>> GetOverdueAsync();
    Task<IEnumerable<Installment>> GetByDebtorDocumentAsync(string document);
    Task<Installment> AddAsync(Installment installment);
    Task<Installment> UpdateAsync(Installment installment);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> CountAsync();
}