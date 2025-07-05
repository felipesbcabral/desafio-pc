using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using DebtManager.Core.Infrastructure.Persistence;

namespace DebtManager.Tests.Integration;

public class BaseIntegrationTest : IDisposable
{
    protected readonly ApiFactory _apiFactory;
    private readonly IServiceScope _scope;
    protected readonly JsonSerializerOptions _jsonSerializerOptions;
    protected readonly AppDbContext _dbContext;
    protected readonly HttpClient _httpClient;

    protected BaseIntegrationTest(SharedContainerFixture containerFixture)
    {
        _apiFactory = new ApiFactory(containerFixture);
        _jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        _scope = _apiFactory.Services.CreateScope();
        _dbContext = _scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Ensure database is created and apply migrations
        _dbContext.Database.EnsureCreated();
        
        // Clean database before each test
        CleanDatabase();
        
        _httpClient = _apiFactory.CreateClient();
    }

    private void CleanDatabase()
    {
        // Remove all data from tables
        _dbContext.Installments.RemoveRange(_dbContext.Installments);
        _dbContext.DebtTitles.RemoveRange(_dbContext.DebtTitles);
        _dbContext.SaveChanges();
    }

    public void Dispose()
    {
        _scope?.Dispose();
        _httpClient?.Dispose();
    }
}