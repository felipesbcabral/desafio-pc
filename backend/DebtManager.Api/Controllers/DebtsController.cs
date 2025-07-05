using Microsoft.AspNetCore.Mvc;
using DebtManager.Core.Application.Interfaces;
using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Exceptions;
using DebtManager.Core.Application.DTOs;
using DebtManager.Api.Services;
using DebtManager.Api.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        var debtTitles = await _debtTitleService.GetAllAsync();
        var response = debtTitles.Select(_mappingService.MapToResponse);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DebtTitleResponse>> GetDebtById(Guid id)
    {
        if (id == Guid.Empty)
            return BadRequest("ID inválido");

        var debtTitle = await _debtTitleService.GetByIdAsync(id);
        if (debtTitle == null)
            return NotFound();

        var response = _mappingService.MapToResponse(debtTitle);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<DebtTitleResponse>> CreateDebt([FromBody] CreateDebtTitleRequest request)
    {
        var debtTitle = await _debtTitleService.CreateFromRequestAsync(request);
        var response = _mappingService.MapToResponse(debtTitle);
        return CreatedAtAction(nameof(GetDebtById), new { id = debtTitle.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DebtTitleResponse>> UpdateDebt(Guid id, [FromBody] UpdateDebtTitleRequest request)
    {
        var debtTitle = await _debtTitleService.UpdateFromRequestAsync(id, request);
        var response = _mappingService.MapToResponse(debtTitle);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteDebt(Guid id)
    {
        if (id == Guid.Empty)
            return BadRequest("ID inválido");

        var deleted = await _debtTitleService.DeleteAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpGet("by-debtor")]
    public async Task<ActionResult<IEnumerable<DebtTitleResponse>>> GetDebtsByDebtorDocument([FromQuery] string document)
    {
        var debtTitles = await _debtTitleService.GetByDebtorDocumentAsync(document);
        var response = debtTitles.Select(_mappingService.MapToResponse);
        return Ok(response);
    }
}