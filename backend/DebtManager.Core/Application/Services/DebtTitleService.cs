using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;
using DebtManager.Core.Application.Interfaces;
using DebtManager.Core.Application.Common;
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
        _createValidator = createValidator ?? throw new ArgumentNullException(nameof(createValidator));
        _updateValidator = updateValidator ?? throw new ArgumentNullException(nameof(updateValidator));
        _requestMappingService = requestMappingService ?? throw new ArgumentNullException(nameof(requestMappingService));
    }

    public async Task<Result<DebtTitle>> GetByIdAsync(Guid id)
    {
        try
        {
            var debtTitle = await _repository.GetByIdAsync(id);
            if (debtTitle == null)
            {
                return Result<DebtTitle>.Failure($"DebtTitle with id {id} not found");
            }
            return Result<DebtTitle>.Success(debtTitle);
        }
        catch (Exception ex)
        {
            return Result<DebtTitle>.Failure(ex.Message);
        }
    }

    public async Task<Result<IEnumerable<DebtTitle>>> GetAllAsync()
    {
        try
        {
            var debtTitles = await _repository.GetAllAsync();
            return Result<IEnumerable<DebtTitle>>.Success(debtTitles);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DebtTitle>>.Failure(ex.Message);
        }
    }

    public async Task<Result<IEnumerable<DebtTitle>>> GetByDebtorDocumentAsync(string debtorDocument)
    {
        if (string.IsNullOrWhiteSpace(debtorDocument))
        {
            return Result<IEnumerable<DebtTitle>>.Failure("Documento é obrigatório.");
        }

        try
        {
            var debtTitles = await _repository.GetByDebtorDocumentAsync(debtorDocument);
            return Result<IEnumerable<DebtTitle>>.Success(debtTitles);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DebtTitle>>.Failure(ex.Message);
        }
    }

    public async Task<Result<DebtTitle>> CreateDebtTitleAsync(CreateDebtTitleDto dto)
    {
        try
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
            return Result<DebtTitle>.Success(debtTitle);
        }
        catch (Exception ex)
        {
            return Result<DebtTitle>.Failure(ex.Message);
        }
    }

    public async Task<Result<DebtTitle>> CreateFromRequestAsync(CreateDebtTitleRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Result<DebtTitle>.Failure(validationResult.Errors);
        }

        try
        {
            var dto = _requestMappingService.MapToCreateDto(request);
            var result = await CreateDebtTitleAsync(dto);
            return result;
        }
        catch (Exception ex)
        {
            return Result<DebtTitle>.Failure(ex.Message);
        }
    }

    public async Task<Result<DebtTitle>> UpdateFromRequestAsync(Guid id, UpdateDebtTitleRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Result<DebtTitle>.Failure(validationResult.Errors);
        }

        try
        {
            var dto = _requestMappingService.MapToUpdateDto(request);
            var result = await UpdateDebtTitleAsync(id, dto);
            return result;
        }
        catch (Exception ex)
        {
            return Result<DebtTitle>.Failure(ex.Message);
        }
    }

    public async Task<Result<DebtTitle>> UpdateDebtTitleAsync(Guid id, UpdateDebtTitleDto updateDto)
    {
        try
        {
            var debtTitle = await _repository.GetByIdAsync(id);
            if (debtTitle == null)
            {
                return Result<DebtTitle>.Failure($"DebtTitle with id {id} not found");
            }

            debtTitle.UpdateComplete(
                updateDto.TitleNumber, 
                updateDto.OriginalValue, 
                updateDto.DueDate, 
                updateDto.InterestRatePerDay, 
                updateDto.PenaltyRate, 
                updateDto.DebtorName, 
                updateDto.DebtorDocument);
            
            await _repository.UpdateAsync(debtTitle);
            
            return Result<DebtTitle>.Success(debtTitle);
        }
        catch (Exception ex)
        {
            return Result<DebtTitle>.Failure(ex.Message);
        }
    }



    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        try
        {
            var debtTitle = await _repository.GetByIdAsync(id);

            if (debtTitle == null)
            {
                return Result<bool>.Failure($"DebtTitle with id {id} not found");
            }

            await _repository.DeleteAsync(debtTitle.Id);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(ex.Message);
        }
    }

    public async Task<decimal> GetTotalDebtValueAsync()
    {
        var result = await GetAllAsync();
        if (!result.IsSuccess)
        {
            return 0m;
        }
        
        return result.Data!.Sum(dt => dt.CalculateUpdatedValue());
    }
}