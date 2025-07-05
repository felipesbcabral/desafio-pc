using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using DebtManager.Core.Infrastructure.Persistence;

namespace DebtManager.Tests.Integration;

/// <summary>
/// Api factory for integration tests that uses shared Docker containers
/// for better performance and parallel test execution.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SharedContainerFixture _containerFixture;

    public ApiFactory(SharedContainerFixture containerFixture)
    {
        _containerFixture = containerFixture;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            ConfigureDbContext(services);
        });

        builder.UseEnvironment("Testing");
        
        base.ConfigureWebHost(builder);
    }

    private void ConfigureDbContext(IServiceCollection services)
    {
        // Remove existing DbContext registrations
        var context = services.FirstOrDefault(descriptor => descriptor.ServiceType == typeof(AppDbContext));
        if (context != null)
        {
            services.Remove(context);
            var options = services.Where(r => (r.ServiceType == typeof(DbContextOptions))
              || (r.ServiceType.IsGenericType && r.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))).ToArray();
            foreach (var option in options)
            {
                services.Remove(option);
            }
        }

        // Use connection string from the shared container fixture
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(_containerFixture.ConnectionString);
        });
    }
}