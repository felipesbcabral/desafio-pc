using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Services;

public class DebtTitleService(IDebtTitleRepository repository)
{
    private readonly IDebtTitleRepository _repository = repository ?? throw new ArgumentNullException(nameof(repository));

    public async Task<DebtTitle> CreateDebtTitleAsync(
        decimal originalValue,
        DateTime dueDate,
        decimal interestRatePerDay,
        string debtorName,
        string debtorDocument)
    {
        var debtor = new Debtor(debtorName, debtorDocument);
        var debtTitle = new DebtTitle(originalValue, dueDate, interestRatePerDay, debtor);
        
        return await _repository.AddAsync(debtTitle);
    }

    public async Task<DebtTitle> CreateDebtTitleWithInstallmentsAsync(
        decimal originalValue,
        DateTime dueDate,
        decimal interestRatePerDay,
        string debtorName,
        string debtorDocument,
        int numberOfInstallments)
    {
        var debtTitle = await CreateDebtTitleAsync(
            originalValue, dueDate, interestRatePerDay, debtorName, debtorDocument);

        if (numberOfInstallments > 1)
        {
            var installmentValue = originalValue / numberOfInstallments;
            var currentDueDate = dueDate;

            for (int i = 1; i <= numberOfInstallments; i++)
            {
                debtTitle.AddInstallment(i, installmentValue, currentDueDate);
                currentDueDate = currentDueDate.AddMonths(1); // Parcelas mensais
            }
        }

        await _repository.UpdateAsync(debtTitle);
        return debtTitle;
    }

    public async Task<IEnumerable<DebtTitle>> GetAllDebtTitlesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<DebtTitle?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<DebtTitle>> GetByDebtorDocumentAsync(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            throw new ArgumentException("Documento é obrigatório.");

        return await _repository.GetByDebtorDocumentAsync(document);
    }

    public async Task<IEnumerable<DebtTitle>> GetOverdueDebtTitlesAsync()
    {
        return await _repository.GetOverdueAsync();
    }

    public async Task<bool> DeleteDebtTitleAsync(Guid id)
    {
        var exists = await _repository.ExistsAsync(id);
        if (!exists)
            return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<DebtTitle?> UpdateDebtTitleAsync(Guid id, decimal newInterestRate)
    {
        var debtTitle = await _repository.GetByIdAsync(id);
        if (debtTitle == null)
            return null;

        // Como as propriedades são private set, precisaríamos de métodos específicos
        // Por enquanto, retornamos o título existente
        // Em uma implementação mais robusta, adicionaríamos métodos de atualização na entidade
        
        return debtTitle;
    }

    public async Task<decimal> CalculateTotalDebtAsync(string debtorDocument)
    {
        var debtTitles = await GetByDebtorDocumentAsync(debtorDocument);
        
        decimal total = 0;
        foreach (var debtTitle in debtTitles)
        {
            total += debtTitle.CalculateUpdatedValue();
        }

        return total;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _repository.CountAsync();
    }
}