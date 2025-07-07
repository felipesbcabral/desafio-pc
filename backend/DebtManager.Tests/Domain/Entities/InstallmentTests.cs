using DebtManager.Core.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace DebtManager.Tests.Domain.Entities;

public class InstallmentTests
{
    [Fact]
    public void Constructor_ShouldCreateInstallment_WithValidParameters()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var installmentNumber = 1;
        var value = 1000m;
        var dueDate = DateTime.Now.AddDays(30);

        // Act
        var installment = new Installment(debtTitleId, installmentNumber, value, dueDate);

        // Assert
        installment.DebtTitleId.Should().Be(debtTitleId);
        installment.InstallmentNumber.Should().Be(installmentNumber);
        installment.Value.Should().Be(value);
        installment.DueDate.Should().Be(dueDate);
        installment.IsPaid.Should().BeFalse();
        installment.PaidAt.Should().BeNull();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Constructor_ShouldCreateInstallment_WhenInstallmentNumberIsInvalid_ButValidationShouldFailInFluentValidation(int invalidNumber)
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var value = 1000m;
        var dueDate = DateTime.Now.AddDays(30);

        // Act - O construtor não valida mais, mas o FluentValidation deveria falhar
        var installment = new Installment(debtTitleId, invalidNumber, value, dueDate);

        // Assert - O objeto é criado, mas seria inválido no FluentValidation
        installment.InstallmentNumber.Should().Be(invalidNumber);
        installment.Value.Should().Be(value);
        installment.DueDate.Should().Be(dueDate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Constructor_ShouldCreateInstallment_WhenValueIsInvalid_ButValidationShouldFailInFluentValidation(decimal invalidValue)
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var installmentNumber = 1;
        var dueDate = DateTime.Now.AddDays(30);

        // Act - O construtor não valida mais, mas o FluentValidation deveria falhar
        var installment = new Installment(debtTitleId, installmentNumber, invalidValue, dueDate);

        // Assert - O objeto é criado, mas seria inválido no FluentValidation
        installment.InstallmentNumber.Should().Be(installmentNumber);
        installment.Value.Should().Be(invalidValue);
        installment.DueDate.Should().Be(dueDate);
    }

    [Fact]
    public void MarkAsPaid_ShouldSetIsPaidToTrue_AndSetPaidAtToCurrentDate()
    {
        // Arrange
        var installment = CreateValidInstallment();
        var beforePaidAt = DateTime.UtcNow;

        // Act
        installment.MarkAsPaid();
        var afterPaidAt = DateTime.UtcNow;

        // Assert
        installment.IsPaid.Should().BeTrue();
        installment.PaidAt.Should().NotBeNull();
        installment.PaidAt.Should().BeOnOrAfter(beforePaidAt);
        installment.PaidAt.Should().BeOnOrBefore(afterPaidAt);
    }

    [Fact]
    public void MarkAsUnpaid_ShouldSetIsPaidToFalse_AndSetPaidAtToNull()
    {
        // Arrange
        var installment = CreateValidInstallment();
        installment.MarkAsPaid();

        // Act
        installment.MarkAsUnpaid();

        // Assert
        installment.IsPaid.Should().BeFalse();
        installment.PaidAt.Should().BeNull();
    }

    [Fact]
    public void IsOverdue_ShouldReturnTrue_WhenDueDateIsInPastAndNotPaid()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(-10)
        );

        // Act
        var result = installment.IsOverdue();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsOverdue_ShouldReturnFalse_WhenDueDateIsInFuture()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(10)
        );

        // Act
        var result = installment.IsOverdue();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsOverdue_ShouldReturnFalse_WhenInstallmentIsPaid()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(-10)
        );
        installment.MarkAsPaid();

        // Act
        var result = installment.IsOverdue();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void GetDaysOverdue_ShouldReturnZero_WhenNotOverdue()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(10)
        );

        // Act
        var result = installment.GetDaysOverdue();

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void GetDaysOverdue_ShouldReturnCorrectDays_WhenOverdue()
    {
        // Arrange
        var daysOverdue = 15;
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.Date.AddDays(-daysOverdue)
        );

        // Act
        var result = installment.GetDaysOverdue();

        // Assert
        result.Should().Be(daysOverdue);
    }

    [Fact]
    public void CalculateInterest_ShouldReturnZero_WhenNotOverdue()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(10)
        );
        var monthlyInterestRate = 0.02m; // 2% ao mês

        // Act
        var result = installment.CalculateInterest(monthlyInterestRate);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateInterest_ShouldCalculateCorrectly_WhenOverdue()
    {
        // Arrange
        var daysOverdue = 30;
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.Date.AddDays(-daysOverdue)
        );
        var monthlyInterestRate = 0.02m; // 2% ao mês

        // Expected: (0.02 / 30) * 30 * 1000 = 20
        var expectedInterest = (monthlyInterestRate / 30) * daysOverdue * installment.Value;

        // Act
        var result = installment.CalculateInterest(monthlyInterestRate);

        // Assert
        result.Should().Be(expectedInterest);
    }

    [Fact]
    public void CalculateUpdatedValue_ShouldReturnOriginalValue_WhenNotOverdue()
    {
        // Arrange
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(10)
        );
        var monthlyInterestRate = 0.02m;
        var penaltyRate = 0.1m;

        // Act
        var result = installment.CalculateUpdatedValue(monthlyInterestRate, penaltyRate);

        // Assert
        result.Should().Be(installment.Value);
    }

    [Fact]
    public void CalculateUpdatedValue_ShouldIncludeInterestAndPenalty_WhenOverdue()
    {
        // Arrange
        var daysOverdue = 30;
        var installment = new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.Date.AddDays(-daysOverdue)
        );
        var monthlyInterestRate = 0.02m; // 2% ao mês
        var penaltyRate = 0.1m; // 10%

        var expectedInterest = (monthlyInterestRate / 30) * daysOverdue * installment.Value; // 20
        var expectedPenalty = installment.Value * (penaltyRate / 100); // 10 (não 100)
        var expectedTotal = installment.Value + expectedInterest + expectedPenalty; // 1030

        // Act
        var result = installment.CalculateUpdatedValue(monthlyInterestRate, penaltyRate);

        // Assert
        result.Should().Be(expectedTotal);
    }

    private static Installment CreateValidInstallment()
    {
        return new Installment(
            Guid.NewGuid(),
            1,
            1000m,
            DateTime.Now.AddDays(30)
        );
    }
}