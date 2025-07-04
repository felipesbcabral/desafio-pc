using DebtManager.Core.Infrastructure.Persistence;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Infrastructure.Repositories;
using DebtManager.Core.Application.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configuração do Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Injeção de dependência
builder.Services.AddScoped<IDebtTitleRepository, DebtTitleRepository>();
builder.Services.AddScoped<IInstallmentRepository, InstallmentRepository>();
builder.Services.AddScoped<DebtTitleService>();
builder.Services.AddScoped<InstallmentService>();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "DebtManager API",
        Version = "v1",
        Description = "API para gestão de títulos de dívida",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "DebtManager Team",
            Email = "contact@debtmanager.com"
        }
    });
    
    // Configuração para incluir comentários XML
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DebtManager API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "DebtManager API Documentation";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Usar CORS
app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
