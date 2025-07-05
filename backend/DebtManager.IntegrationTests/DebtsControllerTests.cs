using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DebtManager.Api.DTOs;
using DebtManager.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;
using CoreCreateDebtTitleRequest = DebtManager.Core.Application.DTOs.CreateDebtTitleRequest;
using CoreUpdateDebtTitleRequest = DebtManager.Core.Application.DTOs.UpdateDebtTitleRequest;
using CoreInstallmentRequest = DebtManager.Core.Application.DTOs.InstallmentRequest;

namespace DebtManager.Tests.Integration;

[Collection("IntegrationTests")]
public class DebtsControllerTests(SharedContainerFixture containerFixture): BaseIntegrationTest(containerFixture)
{
    [Fact]
    public async Task CreateDebt_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var request = new CoreCreateDebtTitleRequest
        {
            TitleNumber = "DEBT-001",
            OriginalValue = 1000.00m,
            DueDate = DateTime.Now.AddDays(30),
            InterestRatePerDay = 0.01m,
            PenaltyRate = 0.02m,
            DebtorName = "João Silva",
            DebtorDocument = "12345678909",
            Installments = new List<CoreInstallmentRequest>
            {
                new CoreInstallmentRequest
                {
                    InstallmentNumber = 1,
                    Value = 500.00m,
                    DueDate = DateTime.Now.AddDays(30)
                },
                new CoreInstallmentRequest
                {
                    InstallmentNumber = 2,
                    Value = 500.00m,
                    DueDate = DateTime.Now.AddDays(60)
                }
            }
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/debts", request, _jsonSerializerOptions);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var debtResponse = await response.Content.ReadFromJsonAsync<DebtTitleResponse>(_jsonSerializerOptions);
        Assert.NotNull(debtResponse);
        Assert.NotEqual(Guid.Empty, debtResponse.Id);
        Assert.Equal(request.TitleNumber, debtResponse.TitleNumber);
        Assert.Equal(request.DebtorName, debtResponse.DebtorName);
        Assert.Equal(2, debtResponse.Installments.Count);

        // Verify in database
        var debtInDb = await _dbContext.DebtTitles
            .Include(d => d.Installments)
            .FirstOrDefaultAsync(d => d.Id == debtResponse.Id);
        Assert.NotNull(debtInDb);
        Assert.Equal(request.TitleNumber, debtInDb.TitleNumber);
        Assert.Equal(2, debtInDb.Installments.Count);
    }

    [Fact]
    public async Task GetAllDebts_ShouldReturnAllDebts()
    {
        // Arrange
        var debt1 = CreateTestDebtTitle("DEBT-001", "João Silva", "12345678909");
        var debt2 = CreateTestDebtTitle("DEBT-002", "Maria Santos", "98765432100");
        
        _dbContext.DebtTitles.AddRange(debt1, debt2);
        await _dbContext.SaveChangesAsync();

        // Act
        var response = await _httpClient.GetAsync("/api/debts");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var debts = await response.Content.ReadFromJsonAsync<List<DebtTitleResponse>>(_jsonSerializerOptions);
        Assert.NotNull(debts);
        Assert.Equal(2, debts.Count);
        Assert.Contains(debts, d => d.TitleNumber == "DEBT-001");
        Assert.Contains(debts, d => d.TitleNumber == "DEBT-002");
    }

    [Fact]
    public async Task GetDebtById_WithValidId_ShouldReturnDebt()
    {
        // Arrange
        var debt = CreateTestDebtTitle("DEBT-001", "João Silva", "12345678909");
        _dbContext.DebtTitles.Add(debt);
        await _dbContext.SaveChangesAsync();

        // Act
        var response = await _httpClient.GetAsync($"/api/debts/{debt.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var debtResponse = await response.Content.ReadFromJsonAsync<DebtTitleResponse>(_jsonSerializerOptions);
        Assert.NotNull(debtResponse);
        Assert.Equal(debt.Id, debtResponse.Id);
        Assert.Equal(debt.TitleNumber, debtResponse.TitleNumber);
    }

    [Fact]
    public async Task GetDebtById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var invalidId = Guid.NewGuid();

        // Act
        var response = await _httpClient.GetAsync($"/api/debts/{invalidId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateDebt_WithValidData_ShouldReturnOk()
    {
        // Arrange
        var debt = CreateTestDebtTitle("DEBT-001", "João Silva", "12345678909");
        _dbContext.DebtTitles.Add(debt);
        await _dbContext.SaveChangesAsync();

        var updateRequest = new CoreUpdateDebtTitleRequest
        {
            TitleNumber = "DEBT-001-UPDATED",
            OriginalValue = 1500.00m,
            DueDate = DateTime.Now.AddDays(45),
            InterestRatePerDay = 0.015m,
            PenaltyRate = 0.025m,
            DebtorName = "João Silva Santos",
            DebtorDocument = "12345678909"
        };

        // Act
        var response = await _httpClient.PutAsJsonAsync($"/api/debts/{debt.Id}", updateRequest, _jsonSerializerOptions);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var updatedDebt = await response.Content.ReadFromJsonAsync<DebtTitleResponse>(_jsonSerializerOptions);
        Assert.NotNull(updatedDebt);
        Assert.Equal(updateRequest.TitleNumber, updatedDebt.TitleNumber);
        Assert.Equal(updateRequest.DebtorName, updatedDebt.DebtorName);
    }

    [Fact]
    public async Task DeleteDebt_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        var debt = CreateTestDebtTitle("DEBT-001", "João Silva", "12345678909");
        _dbContext.DebtTitles.Add(debt);
        await _dbContext.SaveChangesAsync();

        // Act
        var response = await _httpClient.DeleteAsync($"/api/debts/{debt.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        
        _dbContext.ChangeTracker.Clear();
        var deletedDebt = await _dbContext.DebtTitles.FindAsync(debt.Id);
        Assert.Null(deletedDebt);
    }

    [Fact]
    public async Task GetDebtsByDebtorDocument_ShouldReturnDebtsForDebtor()
    {
        // Arrange
        var document = "12345678909";
        var debt1 = CreateTestDebtTitle("DEBT-001", "João Silva", document);
        var debt2 = CreateTestDebtTitle("DEBT-002", "João Silva", document);
        var debt3 = CreateTestDebtTitle("DEBT-003", "Maria Santos", "98765432100");
        
        _dbContext.DebtTitles.AddRange(debt1, debt2, debt3);
        await _dbContext.SaveChangesAsync();

        // Act
        var response = await _httpClient.GetAsync($"/api/debts/by-debtor?document={document}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var debts = await response.Content.ReadFromJsonAsync<List<DebtTitleResponse>>(_jsonSerializerOptions);
        Assert.NotNull(debts);
        Assert.Equal(2, debts.Count);
        Assert.All(debts, d => Assert.Equal("123.456.789-09", d.DebtorDocument));
    }

    [Fact]
    public async Task CreateDebt_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var request = new CoreCreateDebtTitleRequest
        {
            TitleNumber = "",
            OriginalValue = -100,
            DueDate = DateTime.Now.AddDays(30),
            InterestRatePerDay = 0.01m,
            PenaltyRate = 0.02m,
            DebtorName = "",
            DebtorDocument = "", 
            Installments = new List<CoreInstallmentRequest>()
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/debts", request, _jsonSerializerOptions);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private DebtTitle CreateTestDebtTitle(string titleNumber, string debtorName, string debtorDocument)
    {
        var debt = new DebtTitle(
            titleNumber,
            1000.00m,
            DateTime.Now.AddDays(30),
            0.01m,
            0.02m,
            debtorName,
            debtorDocument
        );

        debt.AddInstallment(1, 500.00m, DateTime.Now.AddDays(30));
        debt.AddInstallment(2, 500.00m, DateTime.Now.AddDays(60));

        return debt;
    }
}