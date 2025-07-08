using Testcontainers.MsSql;
using Microsoft.Data.SqlClient;
using Xunit;

namespace DebtManager.Tests.Integration;

/// <summary>
/// Shared container fixture for integration tests.
/// Manages Docker containers lifecycle across all test classes.
/// </summary>
public class SharedContainerFixture : IAsyncLifetime
{
    private MsSqlContainer? _sqlServerContainer;
    
    public string ConnectionString { get; private set; } = string.Empty;
    
    public async Task InitializeAsync()
    {
        _sqlServerContainer = new MsSqlBuilder()
            .WithPassword("DebtManager123!")
            .WithCleanUp(true)
            .Build();
            
        await _sqlServerContainer.StartAsync();
        
        ConnectionString = _sqlServerContainer.GetConnectionString();
        
        await WaitForSqlServerToBeReady();
    }
    
    public async Task DisposeAsync()
    {
        if (_sqlServerContainer != null)
        {
            await _sqlServerContainer.DisposeAsync();
        }
    }
    
    private async Task WaitForSqlServerToBeReady()
    {
        var maxRetries = 30;
        var retryCount = 0;
        
        while (retryCount < maxRetries)
        {
            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync();
                await connection.CloseAsync();
                return;
            }
            catch
            {
                retryCount++;
                await Task.Delay(1000);
            }
        }
        
        throw new InvalidOperationException("SQL Server container failed to start within the expected time.");
    }
}