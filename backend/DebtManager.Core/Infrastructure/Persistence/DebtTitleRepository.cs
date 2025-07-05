using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DebtManager.Core.Infrastructure.Persistence;

public class DebtTitleRepository : IDebtTitleRepository
{
    private readonly AppDbContext _context;

    public DebtTitleRepository(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<DebtTitle> AddAsync(DebtTitle debtTitle)
    {
        ArgumentNullException.ThrowIfNull(debtTitle);

        await _context.DebtTitles.AddAsync(debtTitle);
        await _context.SaveChangesAsync();
        return debtTitle;
    }

    public async Task<DebtTitle?> GetByIdAsync(Guid id)
    {
        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .FirstOrDefaultAsync(dt => dt.Id == id);
    }

    public async Task<IEnumerable<DebtTitle>> GetAllAsync()
    {
        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .OrderByDescending(dt => dt.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(DebtTitle debtTitle)
    {
        if (debtTitle == null)
            throw new ArgumentNullException(nameof(debtTitle));

        _context.DebtTitles.Update(debtTitle);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var debtTitle = await GetByIdAsync(id);
        if (debtTitle != null)
        {
            _context.DebtTitles.Remove(debtTitle);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<DebtTitle>> GetByDebtorDocumentAsync(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            throw new ArgumentException("Document cannot be null or empty", nameof(document));

        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .Where(dt => dt.Debtor.Document.Value == document)
            .OrderByDescending(dt => dt.CreatedAt)
            .ToListAsync();
    }
}