using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Services;

public class DebtTitleService(IDebtTitleRepository repository)
{
    private readonly IDebtTitleRepository _repository = repository ?? throw new ArgumentNullException(nameof(repository));

    public async Task<DebtTitle> CreateDebtTitleAsync(
        string titleNumber,
        decimal originalValue,
        DateTime dueDate,
        decimal interestRatePerDay,
        decimal penaltyRate,
        string debtorName,
        string debtorDocument)
    {
        var debtor = new Debtor(debtorName, debtorDocument);
        var debtTitle = new DebtTitle(titleNumber, originalValue, dueDate, interestRatePerDay, penaltyRate, debtor);
        
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
            "TEMP-" + Guid.NewGuid().ToString()[..8], originalValue, dueDate, interestRatePerDay, 2.0m, debtorName, debtorDocument);

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

    public async Task<DebtTitle> CreateDebtTitleWithCustomInstallmentsAsync(
        string titleNumber,
        decimal interestRatePerDay,
        decimal penaltyRate,
        string debtorName,
        string debtorDocument,
        List<(int number, decimal value, DateTime dueDate)> installments,
        decimal? originalValue = null)
    {
        // Calcula o valor original se não fornecido
        var calculatedOriginalValue = originalValue ?? installments.Sum(i => i.value);
        
        // Usa a data de vencimento da primeira parcela como data base
        var baseDueDate = installments.OrderBy(i => i.number).First().dueDate;
        
        var debtor = new Debtor(debtorName, debtorDocument);
        var debtTitle = new DebtTitle(titleNumber, calculatedOriginalValue, baseDueDate, interestRatePerDay, penaltyRate, debtor);
        
        // Adiciona as parcelas customizadas
        foreach (var (number, value, dueDate) in installments)
        {
            debtTitle.AddInstallment(number, value, dueDate);
        }
        
        return await _repository.AddAsync(debtTitle);
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



    public async Task<DebtTitle?> UpdateDebtTitleAsync(Guid id, UpdateDebtTitleDto updateDto)
    {
        var debtTitle = await _repository.GetByIdAsync(id);
        if (debtTitle == null)
            return null;

        debtTitle.UpdateComplete(
            updateDto.TitleNumber, 
            updateDto.OriginalValue, 
            updateDto.DueDate, 
            updateDto.InterestRatePerDay, 
            updateDto.PenaltyRate, 
            updateDto.DebtorName, 
            updateDto.DebtorDocument);
        
        await _repository.UpdateAsync(debtTitle);
        
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