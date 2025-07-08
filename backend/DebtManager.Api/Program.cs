using DebtManager.Core.Infrastructure.Persistence;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Application.Services;
using DebtManager.Core.Application.Interfaces;
using DebtManager.Api.Validators;
using DebtManager.Api.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IDebtTitleRepository, DebtTitleRepository>();
builder.Services.AddScoped<IDebtTitleService, DebtTitleService>();
builder.Services.AddScoped<MappingService>();
builder.Services.AddScoped<IRequestMappingService, RequestMappingService>();
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
    
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

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

app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();


app.Run();

// Torna a classe Program pública para testes de integração
public partial class Program { }
