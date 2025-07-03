using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Domain.ValueObjects;
using FluentAssertions;
using Moq;
using Xunit;

namespace DebtManager.Tests.Application.Services;

public class DebtTitleServiceTests
{
    private readonly Mock<IDebtTitleRepository> _mockRepository;
    private readonly DebtTitleService _service;

    public DebtTitleServiceTests()
    {
        _mockRepository = new Mock<IDebtTitleRepository>();
        _service = new DebtTitleService(_mockRepository.Object);
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenRepositoryIsNull()
    {
        // Act & Assert
        var action = () => new DebtTitleService(null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("repository");
    }

    [Fact]
    public async Task CreateDebtTitleAsync_ShouldCreateAndReturnDebtTitle_WithValidParameters()
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var originalValue = 5000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtorName = "João Silva";
        var debtorDocument = "06197942160";

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<DebtTitle>()))
            .ReturnsAsync((DebtTitle dt) => dt);

        // Act
        var result = await _service.CreateDebtTitleAsync(
            titleNumber, originalValue, dueDate, interestRatePerDay, penaltyRate, debtorName, debtorDocument
        );

        // Assert
        result.Should().NotBeNull();
        result.TitleNumber.Should().Be(titleNumber);
        result.OriginalValue.Should().Be(originalValue);
        result.DueDate.Should().Be(dueDate);
        result.InterestRatePerDay.Should().Be(interestRatePerDay);
        result.PenaltyRate.Should().Be(penaltyRate);
        result.Debtor.Name.Should().Be(debtorName);
        result.Debtor.Document.Value.Should().Be(debtorDocument);

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<DebtTitle>()), Times.Once);
    }

    [Fact]
    public async Task CreateDebtTitleWithInstallmentsAsync_ShouldCreateDebtTitleWithInstallments_WhenNumberOfInstallmentsIsGreaterThanOne()
    {
        // Arrange
        var originalValue = 3000m;
        var dueDate = DateTime.Now.AddDays(30);
        var interestRatePerDay = 0.001m;
        var debtorName = "João Silva";
        var debtorDocument = "06197942160";
        var numberOfInstallments = 3;

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<DebtTitle>()))
            .ReturnsAsync((DebtTitle dt) => dt);
        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<DebtTitle>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.CreateDebtTitleWithInstallmentsAsync(
            originalValue, dueDate, interestRatePerDay, debtorName, debtorDocument, numberOfInstallments
        );

        // Assert
        result.Should().NotBeNull();
        result.OriginalValue.Should().Be(originalValue);
        result.DueDate.Should().Be(dueDate);
        result.InterestRatePerDay.Should().Be(interestRatePerDay);
        result.PenaltyRate.Should().Be(2.0m); // O serviço usa 2.0m como padrão
        result.Debtor.Name.Should().Be(debtorName);
        result.Debtor.Document.Value.Should().Be(debtorDocument);
        result.Installments.Should().HaveCount(numberOfInstallments);

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<DebtTitle>()), Times.Once);
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<DebtTitle>()), Times.Once);
    }

    [Fact]
    public async Task CreateDebtTitleWithCustomInstallmentsAsync_ShouldCreateDebtTitleWithCustomInstallments()
    {
        // Arrange
        var titleNumber = "TITLE-001";
        var interestRatePerDay = 0.001m;
        var penaltyRate = 0.1m;
        var debtorName = "João Silva";
        var debtorDocument = "06197942160";
        var installments = new List<(int number, decimal value, DateTime dueDate)>
        {
            (1, 1000m, DateTime.Now.AddDays(30)),
            (2, 1500m, DateTime.Now.AddDays(60)),
            (3, 2000m, DateTime.Now.AddDays(90))
        };

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<DebtTitle>()))
            .ReturnsAsync((DebtTitle dt) => dt);

        // Act
        var result = await _service.CreateDebtTitleWithCustomInstallmentsAsync(
            titleNumber, interestRatePerDay, penaltyRate, debtorName, debtorDocument, installments
        );

        // Assert
        result.Should().NotBeNull();
        result.TitleNumber.Should().Be(titleNumber);
        result.OriginalValue.Should().Be(4500m); // Soma das parcelas
        result.DueDate.Should().Be(installments[0].dueDate); // Data da primeira parcela
        result.InterestRatePerDay.Should().Be(interestRatePerDay);
        result.PenaltyRate.Should().Be(penaltyRate);
        result.Debtor.Name.Should().Be(debtorName);
        result.Debtor.Document.Value.Should().Be(debtorDocument);
        result.Installments.Should().HaveCount(installments.Count);

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<DebtTitle>()), Times.Once);
    }

    [Fact]
    public async Task GetAllDebtTitlesAsync_ShouldReturnAllDebtTitles()
    {
        // Arrange
        var expectedDebtTitles = new List<DebtTitle>
        {
            CreateSampleDebtTitle("TITLE-001"),
            CreateSampleDebtTitle("TITLE-002")
        };

        _mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(expectedDebtTitles);

        // Act
        var result = await _service.GetAllDebtTitlesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDebtTitles);

        _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnDebtTitle_WhenExists()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var expectedDebtTitle = CreateSampleDebtTitle("TITLE-001");

        _mockRepository.Setup(r => r.GetByIdAsync(debtTitleId))
            .ReturnsAsync(expectedDebtTitle);

        // Act
        var result = await _service.GetByIdAsync(debtTitleId);

        // Assert
        result.Should().NotBeNull();
        result.Should().Be(expectedDebtTitle);

        _mockRepository.Verify(r => r.GetByIdAsync(debtTitleId), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(debtTitleId))
            .ReturnsAsync((DebtTitle?)null);

        // Act
        var result = await _service.GetByIdAsync(debtTitleId);

        // Assert
        result.Should().BeNull();

        _mockRepository.Verify(r => r.GetByIdAsync(debtTitleId), Times.Once);
    }

    [Fact]
    public async Task GetByDebtorDocumentAsync_ShouldReturnDebtTitles_WhenDocumentIsValid()
    {
        // Arrange
        var document = "06197942160";
        var expectedDebtTitles = new List<DebtTitle>
        {
            CreateSampleDebtTitle("TITLE-001"),
            CreateSampleDebtTitle("TITLE-002")
        };

        _mockRepository.Setup(r => r.GetByDebtorDocumentAsync(document))
            .ReturnsAsync(expectedDebtTitles);

        // Act
        var result = await _service.GetByDebtorDocumentAsync(document);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDebtTitles);

        _mockRepository.Verify(r => r.GetByDebtorDocumentAsync(document), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task GetByDebtorDocumentAsync_ShouldThrowArgumentException_WhenDocumentIsInvalid(string invalidDocument)
    {
        // Act & Assert
        var action = async () => await _service.GetByDebtorDocumentAsync(invalidDocument);
        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Documento é obrigatório.");

        _mockRepository.Verify(r => r.GetByDebtorDocumentAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetOverdueDebtTitlesAsync_ShouldReturnOverdueDebtTitles()
    {
        // Arrange
        var expectedDebtTitles = new List<DebtTitle>
        {
            CreateSampleDebtTitle("TITLE-001"),
            CreateSampleDebtTitle("TITLE-002")
        };

        _mockRepository.Setup(r => r.GetOverdueAsync())
            .ReturnsAsync(expectedDebtTitles);

        // Act
        var result = await _service.GetOverdueDebtTitlesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDebtTitles);

        _mockRepository.Verify(r => r.GetOverdueAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteDebtTitleAsync_ShouldReturnTrue_WhenDebtTitleExists()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();

        _mockRepository.Setup(r => r.ExistsAsync(debtTitleId))
            .ReturnsAsync(true);
        _mockRepository.Setup(r => r.DeleteAsync(debtTitleId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteDebtTitleAsync(debtTitleId);

        // Assert
        result.Should().BeTrue();

        _mockRepository.Verify(r => r.ExistsAsync(debtTitleId), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(debtTitleId), Times.Once);
    }

    [Fact]
    public async Task DeleteDebtTitleAsync_ShouldReturnFalse_WhenDebtTitleDoesNotExist()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();

        _mockRepository.Setup(r => r.ExistsAsync(debtTitleId))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeleteDebtTitleAsync(debtTitleId);

        // Assert
        result.Should().BeFalse();

        _mockRepository.Verify(r => r.ExistsAsync(debtTitleId), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task CalculateTotalDebtAsync_ShouldReturnTotalDebt_ForGivenDebtor()
    {
        // Arrange
        var document = "06197942160";
        var debtTitles = new List<DebtTitle>
        {
            CreateSampleDebtTitle("TITLE-001", 1000m),
            CreateSampleDebtTitle("TITLE-002", 2000m)
        };

        _mockRepository.Setup(r => r.GetByDebtorDocumentAsync(document))
            .ReturnsAsync(debtTitles);

        // Act
        var result = await _service.CalculateTotalDebtAsync(document);

        // Assert
        result.Should().BeGreaterThan(0);
        _mockRepository.Verify(r => r.GetByDebtorDocumentAsync(document), Times.Once);
    }

    [Fact]
    public async Task GetTotalCountAsync_ShouldReturnTotalCount()
    {
        // Arrange
        var expectedCount = 10;

        _mockRepository.Setup(r => r.CountAsync())
            .ReturnsAsync(expectedCount);

        // Act
        var result = await _service.GetTotalCountAsync();

        // Assert
        result.Should().Be(expectedCount);

        _mockRepository.Verify(r => r.CountAsync(), Times.Once);
    }

    private static DebtTitle CreateSampleDebtTitle(string titleNumber, decimal originalValue = 5000m)
    {
        var debtor = new Debtor(
            "João Silva",
            "06197942160"
        );

        return new DebtTitle(
            titleNumber,
            originalValue,
            DateTime.Now.AddDays(30),
            0.001m,
            0.1m,
            debtor
        );
    }

    private static Debtor CreateSampleDebtor()
    {
        return new Debtor(
            "João Silva",
            "06197942160"
        );
    }
}