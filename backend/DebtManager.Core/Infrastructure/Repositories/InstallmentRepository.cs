using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DebtManager.Core.Infrastructure.Repositories;

public class InstallmentRepository : IInstallmentRepository
{
    private readonly AppDbContext _context;

    public InstallmentRepository(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Installment?> GetByIdAsync(Guid id)
    {
        return await _context.Installments
            .Include(i => i.DebtTitle)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<Installment>> GetByDebtTitleIdAsync(Guid debtTitleId)
    {
        return await _context.Installments
            .Where(i => i.DebtTitleId == debtTitleId)
            .OrderBy(i => i.InstallmentNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Installment>> GetOverdueAsync()
    {
        var today = DateTime.Now.Date;
        return await _context.Installments
            .Include(i => i.DebtTitle)
            .Where(i => !i.IsPaid && i.DueDate.Date < today)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Installment>> GetByDebtorDocumentAsync(string document)
    {
        return await _context.Installments
            .Include(i => i.DebtTitle)
            .Where(i => i.DebtTitle.Debtor.Document.Value == document)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<Installment> AddAsync(Installment installment)
    {
        _context.Installments.Add(installment);
        await _context.SaveChangesAsync();
        return installment;
    }

    public async Task<Installment> UpdateAsync(Installment installment)
    {
        _context.Installments.Update(installment);
        await _context.SaveChangesAsync();
        return installment;
    }

    public async Task DeleteAsync(Guid id)
    {
        var installment = await _context.Installments.FindAsync(id);
        if (installment != null)
        {
            _context.Installments.Remove(installment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Installments.AnyAsync(i => i.Id == id);
    }

    public async Task<int> CountAsync()
    {
        return await _context.Installments.CountAsync();
    }
}