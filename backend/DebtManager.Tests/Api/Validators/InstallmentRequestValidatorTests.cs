using DebtManager.Api.Validators;
using DebtManager.Core.Application.DTOs;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace DebtManager.Tests.Api.Validators;

public class InstallmentRequestValidatorTests
{
    private readonly InstallmentRequestValidator _validator;

    public InstallmentRequestValidatorTests()
    {
        _validator = new InstallmentRequestValidator();
    }

    [Fact]
    public void Should_Have_Error_When_InstallmentNumber_Is_Zero()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = 0,
            Value = 1000m,
            DueDate = DateTime.Now.AddDays(30)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.InstallmentNumber)
            .WithErrorMessage("Número da parcela deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_InstallmentNumber_Is_Negative()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = -1,
            Value = 1000m,
            DueDate = DateTime.Now.AddDays(30)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.InstallmentNumber)
            .WithErrorMessage("Número da parcela deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_Value_Is_Zero()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = 1,
            Value = 0m,
            DueDate = DateTime.Now.AddDays(30)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value)
            .WithErrorMessage("Valor da parcela deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_Value_Is_Negative()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = 1,
            Value = -100m,
            DueDate = DateTime.Now.AddDays(30)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value)
            .WithErrorMessage("Valor da parcela deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_DueDate_Is_Empty()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = 1,
            Value = 1000m,
            DueDate = default(DateTime)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.DueDate)
            .WithErrorMessage("Data de vencimento da parcela é obrigatória");
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Properties_Are_Valid()
    {
        // Arrange
        var request = new InstallmentRequest
        {
            InstallmentNumber = 1,
            Value = 1000m,
            DueDate = DateTime.Now.AddDays(30)
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }
}