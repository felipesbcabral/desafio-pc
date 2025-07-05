using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;
using DebtManager.Core.Application.Interfaces;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DebtManager.Core.Application.Services;

public class DebtTitleService : IDebtTitleService
{
    private readonly IDebtTitleRepository _repository;
    private readonly IValidator<CreateDebtTitleRequest> _createValidator;
    private readonly IValidator<UpdateDebtTitleRequest> _updateValidator;
    private readonly IRequestMappingService _requestMappingService;

    public DebtTitleService(
        IDebtTitleRepository repository,
        IValidator<CreateDebtTitleRequest> createValidator,
        IValidator<UpdateDebtTitleRequest> updateValidator,
        IRequestMappingService requestMappingService)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _requestMappingService = requestMappingService;
    }

    public async Task<DebtTitle> GetByIdAsync(Guid id) 
        => await _repository.GetByIdAsync(id);

    public async Task<IEnumerable<DebtTitle>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<IEnumerable<DebtTitle>> GetByDebtorDocumentAsync(string debtorDocument)
    {
        if (string.IsNullOrWhiteSpace(debtorDocument))
            throw new ArgumentException("Documento é obrigatório.");

        return await _repository.GetByDebtorDocumentAsync(debtorDocument);
    }

    public async Task<DebtTitle> CreateDebtTitleAsync(CreateDebtTitleDto dto)
    {
        var debtor = new Debtor(dto.DebtorName, dto.DebtorDocument);
        var originalValue = dto.OriginalValue ?? dto.Installments.Sum(i => i.Value);
        var dueDate = dto.Installments.FirstOrDefault()?.DueDate ?? DateTime.Now.AddDays(30);
        
        var debtTitle = new DebtTitle(
            dto.TitleNumber,
            originalValue,
            dueDate,
            dto.InterestRatePerDay,
            dto.PenaltyRate,
            debtor);

        foreach (var installmentDto in dto.Installments)
        {
            debtTitle.AddInstallment(
                installmentDto.InstallmentNumber,
                installmentDto.Value,
                installmentDto.DueDate);
        }

        await _repository.AddAsync(debtTitle);
        return debtTitle;
    }

    public async Task<DebtTitle> CreateFromRequestAsync(CreateDebtTitleRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var dto = _requestMappingService.MapToCreateDto(request);
        return await CreateDebtTitleAsync(dto);
    }

    public async Task<DebtTitle> UpdateFromRequestAsync(Guid id, UpdateDebtTitleRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var dto = _requestMappingService.MapToUpdateDto(request);
        return await UpdateDebtTitleAsync(id, dto);
    }

    public async Task<DebtTitle> UpdateDebtTitleAsync(Guid id, UpdateDebtTitleDto updateDto)
    {
        var debtTitle = await _repository.GetByIdAsync(id)??
            throw new ArgumentException($"DebtTitle with id {id} not found");

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



    public async Task<bool> DeleteAsync(Guid id)
    {
        var debtTitle = await _repository.GetByIdAsync(id);

        if (debtTitle == null)
            return false;

        await _repository.DeleteAsync(debtTitle.Id);
        return true;
    }

    public async Task<decimal> GetTotalDebtValueAsync()
    {
        var allDebtTitles = await GetAllAsync();
        return allDebtTitles.Sum(dt => dt.CalculateUpdatedValue());
    }
}