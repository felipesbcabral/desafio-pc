using DebtManager.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Domain.Repositories;

public interface IDebtTitleRepository
{
    Task<DebtTitle?> GetByIdAsync(Guid id);
    Task<IEnumerable<DebtTitle>> GetAllAsync();
    Task<IEnumerable<DebtTitle>> GetByDebtorDocumentAsync(string document);
    Task<DebtTitle> AddAsync(DebtTitle debtTitle);
    Task UpdateAsync(DebtTitle debtTitle);
    Task DeleteAsync(Guid id);
}