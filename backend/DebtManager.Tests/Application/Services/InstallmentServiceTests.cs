using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Domain.ValueObjects;
using FluentAssertions;
using Moq;
using Xunit;

namespace DebtManager.Tests.Application.Services;

public class InstallmentServiceTests
{
    private readonly Mock<IInstallmentRepository> _mockInstallmentRepository;
    private readonly Mock<IDebtTitleRepository> _mockDebtTitleRepository;
    private readonly InstallmentService _service;

    public InstallmentServiceTests()
    {
        _mockInstallmentRepository = new Mock<IInstallmentRepository>();
        _mockDebtTitleRepository = new Mock<IDebtTitleRepository>();
        _service = new InstallmentService(_mockInstallmentRepository.Object, _mockDebtTitleRepository.Object);
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenInstallmentRepositoryIsNull()
    {
        // Act & Assert
        var action = () => new InstallmentService(null!, _mockDebtTitleRepository.Object);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("installmentRepository");
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenDebtTitleRepositoryIsNull()
    {
        // Act & Assert
        var action = () => new InstallmentService(_mockInstallmentRepository.Object, null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("debtTitleRepository");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnInstallment_WhenExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();
        var expectedInstallment = CreateSampleInstallment();

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync(expectedInstallment);

        // Act
        var result = await _service.GetByIdAsync(installmentId);

        // Assert
        result.Should().NotBeNull();
        result.Should().Be(expectedInstallment);

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync((Installment?)null);

        // Act
        var result = await _service.GetByIdAsync(installmentId);

        // Assert
        result.Should().BeNull();

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
    }

    [Fact]
    public async Task GetByDebtTitleIdAsync_ShouldReturnInstallments_ForGivenDebtTitle()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var expectedInstallments = new List<Installment>
        {
            CreateSampleInstallment(debtTitleId, 1),
            CreateSampleInstallment(debtTitleId, 2)
        };

        _mockInstallmentRepository.Setup(r => r.GetByDebtTitleIdAsync(debtTitleId))
            .ReturnsAsync(expectedInstallments);

        // Act
        var result = await _service.GetByDebtTitleIdAsync(debtTitleId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedInstallments);

        _mockInstallmentRepository.Verify(r => r.GetByDebtTitleIdAsync(debtTitleId), Times.Once);
    }

    [Fact]
    public async Task GetOverdueInstallmentsAsync_ShouldReturnOverdueInstallments()
    {
        // Arrange
        var expectedInstallments = new List<Installment>
        {
            CreateSampleInstallment(dueDate: DateTime.Now.AddDays(-10)),
            CreateSampleInstallment(dueDate: DateTime.Now.AddDays(-5))
        };

        _mockInstallmentRepository.Setup(r => r.GetOverdueAsync())
            .ReturnsAsync(expectedInstallments);

        // Act
        var result = await _service.GetOverdueInstallmentsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedInstallments);

        _mockInstallmentRepository.Verify(r => r.GetOverdueAsync(), Times.Once);
    }

    [Fact]
    public async Task MarkAsPaidAsync_ShouldMarkInstallmentAsPaid_WhenExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();
        var installment = CreateSampleInstallment();

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync(installment);
        _mockInstallmentRepository.Setup(r => r.UpdateAsync(installment))
            .ReturnsAsync(installment);

        // Act
        var result = await _service.MarkAsPaidAsync(installmentId);

        // Assert
        result.Should().NotBeNull();
        result.Should().Be(installment);
        result!.IsPaid.Should().BeTrue();
        result.PaidAt.Should().NotBeNull();

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
        _mockInstallmentRepository.Verify(r => r.UpdateAsync(installment), Times.Once);
    }

    [Fact]
    public async Task MarkAsPaidAsync_ShouldReturnNull_WhenInstallmentNotExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync((Installment?)null);

        // Act
        var result = await _service.MarkAsPaidAsync(installmentId);

        // Assert
        result.Should().BeNull();

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
        _mockInstallmentRepository.Verify(r => r.UpdateAsync(It.IsAny<Installment>()), Times.Never);
    }

    [Fact]
    public async Task MarkAsUnpaidAsync_ShouldMarkInstallmentAsUnpaid_WhenExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();
        var installment = CreateSampleInstallment();
        installment.MarkAsPaid(); // Primeiro marca como pago

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync(installment);
        _mockInstallmentRepository.Setup(r => r.UpdateAsync(installment))
            .ReturnsAsync(installment);

        // Act
        var result = await _service.MarkAsUnpaidAsync(installmentId);

        // Assert
        result.Should().NotBeNull();
        result.Should().Be(installment);
        result!.IsPaid.Should().BeFalse();
        result.PaidAt.Should().BeNull();

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
        _mockInstallmentRepository.Verify(r => r.UpdateAsync(installment), Times.Once);
    }

    [Fact]
    public async Task MarkAsUnpaidAsync_ShouldReturnNull_WhenInstallmentNotExists()
    {
        // Arrange
        var installmentId = Guid.NewGuid();

        _mockInstallmentRepository.Setup(r => r.GetByIdAsync(installmentId))
            .ReturnsAsync((Installment?)null);

        // Act
        var result = await _service.MarkAsUnpaidAsync(installmentId);

        // Assert
        result.Should().BeNull();

        _mockInstallmentRepository.Verify(r => r.GetByIdAsync(installmentId), Times.Once);
        _mockInstallmentRepository.Verify(r => r.UpdateAsync(It.IsAny<Installment>()), Times.Never);
    }

    [Fact]
    public async Task GetInstallmentsByDebtorDocumentAsync_ShouldReturnInstallments_WhenDocumentIsValid()
    {
        // Arrange
        var document = "12345678901";
        var expectedInstallments = new List<Installment>
        {
            CreateSampleInstallment(),
            CreateSampleInstallment()
        };

        _mockInstallmentRepository.Setup(r => r.GetByDebtorDocumentAsync(document))
            .ReturnsAsync(expectedInstallments);

        // Act
        var result = await _service.GetInstallmentsByDebtorDocumentAsync(document);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedInstallments);

        _mockInstallmentRepository.Verify(r => r.GetByDebtorDocumentAsync(document), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task GetInstallmentsByDebtorDocumentAsync_ShouldThrowArgumentException_WhenDocumentIsInvalid(string invalidDocument)
    {
        // Act & Assert
        var action = async () => await _service.GetInstallmentsByDebtorDocumentAsync(invalidDocument);
        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Documento é obrigatório. (Parameter 'document')");

        _mockInstallmentRepository.Verify(r => r.GetByDebtorDocumentAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task CalculateTotalOverdueValueAsync_ShouldReturnTotalOverdueValue()
    {
        // Arrange
        var debtTitleId1 = Guid.NewGuid();
        var debtTitleId2 = Guid.NewGuid();
        
        var overdueInstallments = new List<Installment>
        {
            CreateSampleInstallment(debtTitleId1, value: 1000m, dueDate: DateTime.Now.AddDays(-10)),
            CreateSampleInstallment(debtTitleId2, value: 2000m, dueDate: DateTime.Now.AddDays(-5))
        };

        var debtTitle1 = new DebtTitle(
            "TITLE-001",
            1000m,
            DateTime.Now.AddDays(-10),
            0.001m, // 0.1% ao dia
            2.0m,   // 2% de multa
            "João Silva",
            "11144477735"
        );
        
        var debtTitle2 = new DebtTitle(
            "TITLE-002",
            2000m,
            DateTime.Now.AddDays(-5),
            0.001m, // 0.1% ao dia
            2.0m,   // 2% de multa
            "Maria Silva",
            "11144477735"
        );

        _mockInstallmentRepository.Setup(r => r.GetOverdueAsync())
            .ReturnsAsync(overdueInstallments);
            
        _mockDebtTitleRepository.Setup(r => r.GetByIdAsync(debtTitleId1))
            .ReturnsAsync(debtTitle1);
            
        _mockDebtTitleRepository.Setup(r => r.GetByIdAsync(debtTitleId2))
            .ReturnsAsync(debtTitle2);

        // Act
        var result = await _service.CalculateTotalOverdueValueAsync();

        // Assert
        result.Should().BeGreaterThan(0);
        _mockInstallmentRepository.Verify(r => r.GetOverdueAsync(), Times.Once);
        _mockDebtTitleRepository.Verify(r => r.GetByIdAsync(debtTitleId1), Times.Once);
        _mockDebtTitleRepository.Verify(r => r.GetByIdAsync(debtTitleId2), Times.Once);
    }

    [Fact]
    public async Task GetTotalCountAsync_ShouldReturnTotalCount()
    {
        // Arrange
        var expectedCount = 15;

        _mockInstallmentRepository.Setup(r => r.CountAsync())
            .ReturnsAsync(expectedCount);

        // Act
        var result = await _service.GetTotalCountAsync();

        // Assert
        result.Should().Be(expectedCount);

        _mockInstallmentRepository.Verify(r => r.CountAsync(), Times.Once);
    }

    [Fact]
    public async Task GetOverdueCountAsync_ShouldReturnOverdueCount()
    {
        // Arrange
        var overdueInstallments = new List<Installment>
        {
            CreateSampleInstallment(dueDate: DateTime.Now.AddDays(-10)),
            CreateSampleInstallment(dueDate: DateTime.Now.AddDays(-5)),
            CreateSampleInstallment(dueDate: DateTime.Now.AddDays(-1))
        };

        _mockInstallmentRepository.Setup(r => r.GetOverdueAsync())
            .ReturnsAsync(overdueInstallments);

        // Act
        var result = await _service.GetOverdueCountAsync();

        // Assert
        result.Should().Be(3);

        _mockInstallmentRepository.Verify(r => r.GetOverdueAsync(), Times.Once);
    }

    private static Installment CreateSampleInstallment(
        Guid? debtTitleId = null,
        int installmentNumber = 1,
        decimal value = 1000m,
        DateTime? dueDate = null)
    {
        return new Installment(
            debtTitleId ?? Guid.NewGuid(),
            installmentNumber,
            value,
            dueDate ?? DateTime.Now.AddDays(30)
        );
    }

    private static Debtor CreateSampleDebtor()
    {
        return new Debtor(
            "João Silva",
            "12345678901"
        );
    }
}