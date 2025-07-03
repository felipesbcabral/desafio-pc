using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DebtManager.Core.Infrastructure.Persistence;

/// <summary>
/// Implementação do repositório de títulos de dívida usando Entity Framework
/// </summary>
public class DebtTitleRepository : IDebtTitleRepository
{
    private readonly AppDbContext _context;

    public DebtTitleRepository(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Adiciona um novo título de dívida
    /// </summary>
    /// <param name="debtTitle">Título de dívida a ser adicionado</param>
    /// <returns>O título de dívida adicionado</returns>
    public async Task<DebtTitle> AddAsync(DebtTitle debtTitle)
    {
        if (debtTitle == null)
            throw new ArgumentNullException(nameof(debtTitle));

        await _context.DebtTitles.AddAsync(debtTitle);
        await _context.SaveChangesAsync();
        return debtTitle;
    }

    /// <summary>
    /// Busca um título de dívida por ID
    /// </summary>
    /// <param name="id">ID do título</param>
    /// <returns>Título de dívida ou null se não encontrado</returns>
    public async Task<DebtTitle?> GetByIdAsync(Guid id)
    {
        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .FirstOrDefaultAsync(dt => dt.Id == id);
    }

    /// <summary>
    /// Busca todos os títulos de dívida
    /// </summary>
    /// <returns>Lista de títulos de dívida</returns>
    public async Task<IEnumerable<DebtTitle>> GetAllAsync()
    {
        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .OrderByDescending(dt => dt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Atualiza um título de dívida existente
    /// </summary>
    /// <param name="debtTitle">Título de dívida a ser atualizado</param>
    /// <returns>Task</returns>
    public async Task UpdateAsync(DebtTitle debtTitle)
    {
        if (debtTitle == null)
            throw new ArgumentNullException(nameof(debtTitle));

        _context.DebtTitles.Update(debtTitle);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Remove um título de dívida
    /// </summary>
    /// <param name="id">ID do título a ser removido</param>
    /// <returns>Task</returns>
    public async Task DeleteAsync(Guid id)
    {
        var debtTitle = await GetByIdAsync(id);
        if (debtTitle != null)
        {
            _context.DebtTitles.Remove(debtTitle);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Verifica se um título de dívida existe
    /// </summary>
    /// <param name="id">ID do título</param>
    /// <returns>True se existe, false caso contrário</returns>
    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.DebtTitles.AnyAsync(dt => dt.Id == id);
    }

    /// <summary>
    /// Busca títulos de dívida por documento do devedor
    /// </summary>
    /// <param name="document">Documento do devedor</param>
    /// <returns>Lista de títulos de dívida</returns>
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

    /// <summary>
    /// Busca títulos de dívida em atraso
    /// </summary>
    /// <returns>Lista de títulos em atraso</returns>
    public async Task<IEnumerable<DebtTitle>> GetOverdueAsync()
    {
        var today = DateTime.Now.Date;
        return await _context.DebtTitles
            .Include(dt => dt.Installments)
            .Where(dt => dt.DueDate.Date < today)
            .OrderByDescending(dt => dt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Conta o total de títulos de dívida
    /// </summary>
    /// <returns>Número total de títulos</returns>
    public async Task<int> CountAsync()
    {
        return await _context.DebtTitles.CountAsync();
    }

    /// <summary>
    /// Salva as mudanças no contexto
    /// </summary>
    /// <returns>Task</returns>
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}