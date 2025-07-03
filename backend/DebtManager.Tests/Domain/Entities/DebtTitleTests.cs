using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace DebtManager.Tests.Domain.Entities;

public class DebtTitleTests
{
    [Fact]
    public void Constructor_ShouldCreateDebtTitle_WithValidParameters()
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtor = CreateValidDebtor();

        // Act
        var debtTitle = new DebtTitle(titleNumber, originalValue, dueDate, interestRatePerDay, penaltyRate, debtor);

        // Assert
        debtTitle.TitleNumber.Should().Be(titleNumber);
        debtTitle.OriginalValue.Should().Be(originalValue);
        debtTitle.DueDate.Should().Be(dueDate);
        debtTitle.InterestRatePerDay.Should().Be(interestRatePerDay);
        debtTitle.PenaltyRate.Should().Be(penaltyRate);
        debtTitle.Debtor.Should().Be(debtor);
        debtTitle.Installments.Should().BeEmpty();
        debtTitle.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Constructor_ShouldThrowArgumentException_WhenTitleNumberIsEmptyOrWhitespace(string invalidTitleNumber)
    {
        // Arrange
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtor = CreateValidDebtor();

        // Act & Assert
        var action = () => new DebtTitle(invalidTitleNumber, originalValue, dueDate, interestRatePerDay, penaltyRate, debtor);
        action.Should().Throw<ArgumentException>()
            .WithMessage("O número do título é obrigatório.");
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenTitleNumberIsNull()
    {
        // Arrange
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtor = CreateValidDebtor();

        // Act & Assert
        var action = () => new DebtTitle(null!, originalValue, dueDate, interestRatePerDay, penaltyRate, debtor);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("titleNumber");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Constructor_ShouldThrowArgumentException_WhenOriginalValueIsInvalid(decimal invalidValue)
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtor = CreateValidDebtor();

        // Act & Assert
        var action = () => new DebtTitle(titleNumber, invalidValue, dueDate, interestRatePerDay, penaltyRate, debtor);
        action.Should().Throw<ArgumentException>()
            .WithMessage("O valor original deve ser maior que zero.");
    }

    [Theory]
    [InlineData(-0.001)]
    [InlineData(-1)]
    public void Constructor_ShouldThrowArgumentException_WhenInterestRateIsNegative(decimal invalidRate)
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var penaltyRate = 0.1m;
        var debtor = CreateValidDebtor();

        // Act & Assert
        var action = () => new DebtTitle(titleNumber, originalValue, dueDate, invalidRate, penaltyRate, debtor);
        action.Should().Throw<ArgumentException>()
            .WithMessage("A taxa de juros não pode ser negativa.");
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(-1)]
    public void Constructor_ShouldThrowArgumentException_WhenPenaltyRateIsNegative(decimal invalidRate)
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var debtor = CreateValidDebtor();

        // Act & Assert
        var action = () => new DebtTitle(titleNumber, originalValue, dueDate, interestRatePerDay, invalidRate, debtor);
        action.Should().Throw<ArgumentException>()
            .WithMessage("A taxa de multa não pode ser negativa.");
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenDebtorIsNull()
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;

        // Act & Assert
        var action = () => new DebtTitle(titleNumber, originalValue, dueDate, interestRatePerDay, penaltyRate, null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("debtor");
    }

    [Fact]
    public void AddInstallment_ShouldAddInstallmentToCollection()
    {
        // Arrange
        var debtTitle = CreateValidDebtTitle();
        var installmentNumber = 1;
        var installmentValue = 1000m;
        var dueDate = DateTime.Now.AddDays(30);

        // Act
        debtTitle.AddInstallment(installmentNumber, installmentValue, dueDate);

        // Assert
        debtTitle.Installments.Should().HaveCount(1);
        var addedInstallment = debtTitle.Installments.First();
        addedInstallment.InstallmentNumber.Should().Be(installmentNumber);
        addedInstallment.Value.Should().Be(installmentValue);
        addedInstallment.DueDate.Should().Be(dueDate);
    }

    [Fact]
    public void AddInstallment_ShouldThrowArgumentException_WhenValueIsZeroOrNegative()
    {
        // Arrange
        var debtTitle = CreateValidDebtTitle();

        // Act & Assert
        var action = () => debtTitle.AddInstallment(1, 0m, DateTime.Now.AddDays(30));
        action.Should().Throw<ArgumentException>();
    }



    [Fact]
    public void CalculateUpdatedValue_ShouldReturnOriginalValue_WhenNoInstallmentsAndNotOverdue()
    {
        // Arrange
        var debtTitle = new DebtTitle(
            "TITLE-001",
            5000m,
            DateTime.Now.AddDays(10),
            0.001m,
            0.1m,
            CreateValidDebtor()
        );

        // Act
        var result = debtTitle.CalculateUpdatedValue();

        // Assert
        result.Should().Be(debtTitle.OriginalValue);
    }

    [Fact]
    public void CalculateUpdatedValue_ShouldIncludeInterestAndPenalty_WhenNoInstallmentsAndOverdue()
    {
        // Arrange
        var daysOverdue = 30;
        var originalValue = 1000m;
        var interestRatePerDay = 0.001m; // 0.1% ao dia
        var penaltyRate = 0.1m; // 10%
        
        var debtTitle = new DebtTitle(
            "TITLE-001",
            originalValue,
            DateTime.Now.Date.AddDays(-daysOverdue),
            interestRatePerDay,
            penaltyRate,
            CreateValidDebtor()
        );

        var expectedInterest = originalValue * (interestRatePerDay / 100) * daysOverdue; // 0.3
        var expectedPenalty = originalValue * (penaltyRate / 100); // 10
        var expectedTotal = originalValue + expectedInterest + expectedPenalty; // 1010.3

        // Act
        var result = debtTitle.CalculateUpdatedValue();

        // Assert
        result.Should().Be(expectedTotal);
    }

    [Fact]
    public void CalculateUpdatedValue_ShouldSumInstallmentValues_WhenHasInstallments()
    {
        // Arrange
        var interestRatePerDay = 0.001m; // 0.1% ao dia (3% ao mês)
        var penaltyRate = 0.1m; // 10%
        
        var debtTitle = new DebtTitle(
            "TITLE-001",
            5000m,
            DateTime.Now.AddDays(30),
            interestRatePerDay,
            penaltyRate,
            CreateValidDebtor()
        );

        // Adicionar parcelas com diferentes situações
        debtTitle.AddInstallment(1, 500m, DateTime.Now.AddDays(-10)); // Em atraso
        debtTitle.AddInstallment(2, 500m, DateTime.Now.AddDays(10));  // Em dia
        
        var installment1 = debtTitle.Installments.First(i => i.InstallmentNumber == 1);
        var installment2 = debtTitle.Installments.First(i => i.InstallmentNumber == 2);

        var monthlyInterestRate = debtTitle.InterestRatePerDay * 30; // 3%
        var expectedInstallment1Value = installment1.CalculateUpdatedValue(monthlyInterestRate, debtTitle.PenaltyRate);
        var expectedInstallment2Value = installment2.CalculateUpdatedValue(monthlyInterestRate, debtTitle.PenaltyRate);
        var expectedTotal = expectedInstallment1Value + expectedInstallment2Value;

        // Act
        var result = debtTitle.CalculateUpdatedValue();

        // Assert
        result.Should().Be(expectedTotal);
    }

    private static DebtTitle CreateValidDebtTitle()
    {
        return new DebtTitle(
            "TITLE-001",
            5000m,
            DateTime.Now.AddDays(30),
            0.001m,
            0.1m,
            CreateValidDebtor()
        );
    }

    private static Debtor CreateValidDebtor()
    {
        return new Debtor(
            "João Silva",
            "11144477735"
        );
    }
}