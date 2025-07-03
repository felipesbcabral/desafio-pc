using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Services;

public class InstallmentService
{
    private readonly IInstallmentRepository _installmentRepository;
    private readonly IDebtTitleRepository _debtTitleRepository;

    public InstallmentService(
        IInstallmentRepository installmentRepository,
        IDebtTitleRepository debtTitleRepository)
    {
        _installmentRepository = installmentRepository ?? throw new ArgumentNullException(nameof(installmentRepository));
        _debtTitleRepository = debtTitleRepository ?? throw new ArgumentNullException(nameof(debtTitleRepository));
    }

    public async Task<Installment?> GetByIdAsync(Guid id)
    {
        return await _installmentRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Installment>> GetByDebtTitleIdAsync(Guid debtTitleId)
    {
        return await _installmentRepository.GetByDebtTitleIdAsync(debtTitleId);
    }

    public async Task<IEnumerable<Installment>> GetOverdueInstallmentsAsync()
    {
        return await _installmentRepository.GetOverdueAsync();
    }

    public async Task<Installment?> MarkAsPaidAsync(Guid installmentId)
    {
        var installment = await _installmentRepository.GetByIdAsync(installmentId);
        if (installment == null)
            return null;

        installment.MarkAsPaid();
        await _installmentRepository.UpdateAsync(installment);
        
        return installment;
    }

    public async Task<Installment?> MarkAsUnpaidAsync(Guid installmentId)
    {
        var installment = await _installmentRepository.GetByIdAsync(installmentId);
        if (installment == null)
            return null;

        installment.MarkAsUnpaid();
        await _installmentRepository.UpdateAsync(installment);
        
        return installment;
    }

    public async Task<IEnumerable<Installment>> GetInstallmentsByDebtorDocumentAsync(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            throw new ArgumentException("Documento é obrigatório.", nameof(document));

        return await _installmentRepository.GetByDebtorDocumentAsync(document);
    }

    public async Task<decimal> CalculateTotalOverdueValueAsync()
    {
        var overdueInstallments = await GetOverdueInstallmentsAsync();
        decimal total = 0;

        foreach (var installment in overdueInstallments)
        {
            var debtTitle = await _debtTitleRepository.GetByIdAsync(installment.DebtTitleId);
            if (debtTitle != null)
            {
                total += installment.CalculateUpdatedValue(
                    debtTitle.InterestRatePerDay / 100, 
                    debtTitle.PenaltyRate);
            }
        }

        return total;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _installmentRepository.CountAsync();
    }

    public async Task<int> GetOverdueCountAsync()
    {
        var overdueInstallments = await GetOverdueInstallmentsAsync();
        return overdueInstallments.Count();
    }
}