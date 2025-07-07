using DebtManager.Api.Validators;
using DebtManager.Core.Application.DTOs;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace DebtManager.Tests.Api.Validators;

public class CreateDebtTitleRequestValidatorTests
{
    private readonly CreateDebtTitleRequestValidator _validator;

    public CreateDebtTitleRequestValidatorTests()
    {
        _validator = new CreateDebtTitleRequestValidator();
    }

    [Fact]
    public void Should_Have_Error_When_TitleNumber_Is_Empty()
    {
        // Arrange
        var request = CreateValidRequest();
        request.TitleNumber = string.Empty;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.TitleNumber)
            .WithErrorMessage("Número do título é obrigatório");
    }

    [Fact]
    public void Should_Have_Error_When_TitleNumber_Is_Null()
    {
        // Arrange
        var request = CreateValidRequest();
        request.TitleNumber = null!;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.TitleNumber)
            .WithErrorMessage("Número do título é obrigatório");
    }

    [Fact]
    public void Should_Have_Error_When_TitleNumber_Is_Too_Long()
    {
        // Arrange
        var request = CreateValidRequest();
        request.TitleNumber = new string('A', 51); // 51 caracteres

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.TitleNumber)
            .WithErrorMessage("Número do título deve ter entre 1 e 50 caracteres");
    }

    [Fact]
    public void Should_Have_Error_When_OriginalValue_Is_Zero()
    {
        // Arrange
        var request = CreateValidRequest();
        request.OriginalValue = 0m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.OriginalValue)
            .WithErrorMessage("Valor deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_OriginalValue_Is_Negative()
    {
        // Arrange
        var request = CreateValidRequest();
        request.OriginalValue = -1000m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.OriginalValue)
            .WithErrorMessage("Valor deve ser maior que zero");
    }

    [Fact]
    public void Should_Have_Error_When_InterestRatePerDay_Is_Negative()
    {
        // Arrange
        var request = CreateValidRequest();
        request.InterestRatePerDay = -1m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.InterestRatePerDay)
            .WithErrorMessage("Taxa de juros deve estar entre 0 e 100");
    }

    [Fact]
    public void Should_Have_Error_When_InterestRatePerDay_Is_Greater_Than_100()
    {
        // Arrange
        var request = CreateValidRequest();
        request.InterestRatePerDay = 101m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.InterestRatePerDay)
            .WithErrorMessage("Taxa de juros deve estar entre 0 e 100");
    }

    [Fact]
    public void Should_Have_Error_When_PenaltyRate_Is_Negative()
    {
        // Arrange
        var request = CreateValidRequest();
        request.PenaltyRate = -1m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.PenaltyRate)
            .WithErrorMessage("Taxa de multa deve estar entre 0 e 100");
    }

    [Fact]
    public void Should_Have_Error_When_PenaltyRate_Is_Greater_Than_100()
    {
        // Arrange
        var request = CreateValidRequest();
        request.PenaltyRate = 101m;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.PenaltyRate)
            .WithErrorMessage("Taxa de multa deve estar entre 0 e 100");
    }

    [Fact]
    public void Should_Have_Error_When_DebtorName_Is_Empty()
    {
        // Arrange
        var request = CreateValidRequest();
        request.DebtorName = string.Empty;

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.DebtorName)
            .WithErrorMessage("Nome do devedor é obrigatório");
    }

    [Fact]
    public void Should_Have_Error_When_DebtorName_Is_Too_Short()
    {
        // Arrange
        var request = CreateValidRequest();
        request.DebtorName = "A"; // 1 caractere

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.DebtorName)
            .WithErrorMessage("Nome deve ter entre 2 e 200 caracteres");
    }

    [Fact]
    public void Should_Have_Error_When_DebtorDocument_Is_Invalid()
    {
        // Arrange
        var request = CreateValidRequest();
        request.DebtorDocument = "123456789"; // Documento inválido

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.DebtorDocument)
            .WithErrorMessage("Documento deve ser um CPF ou CNPJ válido");
    }

    [Fact]
    public void Should_Have_Error_When_Installments_Is_Empty()
    {
        // Arrange
        var request = CreateValidRequest();
        request.Installments = new List<InstallmentRequest>();

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Installments)
            .WithErrorMessage("Pelo menos uma parcela é obrigatória");
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Properties_Are_Valid()
    {
        // Arrange
        var request = CreateValidRequest();

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static CreateDebtTitleRequest CreateValidRequest()
    {
        return new CreateDebtTitleRequest
        {
            TitleNumber = "TITLE-001",
            OriginalValue = 5000m,
            DueDate = DateTime.Now.AddDays(30),
            InterestRatePerDay = 0.1m,
            PenaltyRate = 10m,
            DebtorName = "João Silva",
            DebtorDocument = "11144477735", // CPF válido
            Installments = new List<InstallmentRequest>
            {
                new InstallmentRequest
                {
                    InstallmentNumber = 1,
                    Value = 1000m,
                    DueDate = DateTime.Now.AddDays(30)
                }
            }
        };
    }
}