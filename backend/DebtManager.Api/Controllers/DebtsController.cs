using Microsoft.AspNetCore.Mvc;
using DebtManager.Core.Application.Interfaces;
using DebtManager.Core.Application.DTOs;
using DebtManager.Api.Services;
using DebtManager.Api.DTOs;
using DebtManager.Core.Application.Common;

namespace DebtManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebtsController : ControllerBase
{
    private readonly IDebtTitleService _debtTitleService;
    private readonly MappingService _mappingService;

    public DebtsController(
        IDebtTitleService debtTitleService,
        MappingService mappingService)
    {
        _debtTitleService = debtTitleService ?? throw new ArgumentNullException(nameof(debtTitleService));
        _mappingService = mappingService ?? throw new ArgumentNullException(nameof(mappingService));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DebtTitleResponse>>> GetAllDebts()
    {
        var result = await _debtTitleService.GetAllAsync();
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }
        
        var response = result.Data!.Select(_mappingService.MapToResponse);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DebtTitleResponse>> GetDebtById(Guid id)
    {
        if (id == Guid.Empty)
            return BadRequest("ID inválido");

        var result = await _debtTitleService.GetByIdAsync(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { Message = result.ErrorMessage });
        }

        var response = _mappingService.MapToResponse(result.Data!);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<DebtTitleResponse>> CreateDebt([FromBody] CreateDebtTitleRequest request)
    {
        var result = await _debtTitleService.CreateFromRequestAsync(request);
        
        if (!result.IsSuccess)
        {
            return HandleValidationErrors(result);
        }
        
        var response = _mappingService.MapToResponse(result.Data!);
        return CreatedAtAction(nameof(GetDebtById), new { id = result.Data!.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DebtTitleResponse>> UpdateDebt(Guid id, [FromBody] UpdateDebtTitleRequest request)
    {
        var result = await _debtTitleService.UpdateFromRequestAsync(id, request);
        
        if (!result.IsSuccess)
        {
            return HandleValidationErrors(result);
        }
        
        var response = _mappingService.MapToResponse(result.Data!);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteDebt(Guid id)
    {
        if (id == Guid.Empty)
            return BadRequest("ID inválido");

        var result = await _debtTitleService.DeleteAsync(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { Message = result.ErrorMessage });
        }

        return NoContent();
    }

    [HttpGet("by-debtor")]
    public async Task<ActionResult<IEnumerable<DebtTitleResponse>>> GetDebtsByDebtorDocument([FromQuery] string document)
    {
        var result = await _debtTitleService.GetByDebtorDocumentAsync(document);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }
        
        var response = result.Data!.Select(_mappingService.MapToResponse);
        return Ok(response);
    }

    private ActionResult HandleValidationErrors<T>(Result<T> result)
    {
        if (result.Errors.Any())
        {
            var errors = result.Errors.Select(error => new
            {
                error.PropertyName,
                error.ErrorMessage,
                error.AttemptedValue
            });
            
            return BadRequest(new
            {
                Message = "Erro de validação",
                Errors = errors
            });
        }
        
        return BadRequest(new { Message = result.ErrorMessage });
    }
}