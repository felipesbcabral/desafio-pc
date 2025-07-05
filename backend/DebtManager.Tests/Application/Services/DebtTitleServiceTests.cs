using DebtManager.Core.Application.Services;
using DebtManager.Core.Domain.Entities;
using DebtManager.Core.Domain.Repositories;
using DebtManager.Core.Domain.ValueObjects;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Application.Interfaces;
using FluentValidation;
using FluentAssertions;
using Moq;
using Xunit;

namespace DebtManager.Tests.Application.Services;

public class DebtTitleServiceTests
{
    private readonly Mock<IDebtTitleRepository> _mockRepository;
    private readonly Mock<IValidator<CreateDebtTitleRequest>> _mockCreateValidator;
    private readonly Mock<IValidator<UpdateDebtTitleRequest>> _mockUpdateValidator;
    private readonly Mock<IRequestMappingService> _mockMappingService;
    private readonly DebtTitleService _service;

    public DebtTitleServiceTests()
    {
        _mockRepository = new Mock<IDebtTitleRepository>();
        _mockCreateValidator = new Mock<IValidator<CreateDebtTitleRequest>>();
        _mockUpdateValidator = new Mock<IValidator<UpdateDebtTitleRequest>>();
        _mockMappingService = new Mock<IRequestMappingService>();
        _service = new DebtTitleService(_mockRepository.Object, _mockCreateValidator.Object, _mockUpdateValidator.Object, _mockMappingService.Object);
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenRepositoryIsNull()
    {
        // Act & Assert
        var action = () => new DebtTitleService(null!, _mockCreateValidator.Object, _mockUpdateValidator.Object, _mockMappingService.Object);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("repository");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllDebtTitles()
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
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data.Should().BeEquivalentTo(expectedDebtTitles);

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
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(expectedDebtTitle);

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
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();

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
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data.Should().BeEquivalentTo(expectedDebtTitles);

        _mockRepository.Verify(r => r.GetByDebtorDocumentAsync(document), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task GetByDebtorDocumentAsync_ShouldReturnFailure_WhenDocumentIsInvalid(string invalidDocument)
    {
        // Act
        var result = await _service.GetByDebtorDocumentAsync(invalidDocument);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Documento é obrigatório.");

        _mockRepository.Verify(r => r.GetByDebtorDocumentAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnTrue_WhenDebtTitleExists()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();
        var debtTitle = new DebtTitle(
            "TITLE-001",
            100m,
            DateTime.Now.AddDays(-30),
            0.01m,
            0.05m,
            new Debtor("Test Debtor", "12345678909")
        );

        _mockRepository.Setup(r => r.GetByIdAsync(debtTitleId))
            .ReturnsAsync(debtTitle);
        _mockRepository.Setup(r => r.DeleteAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteAsync(debtTitleId);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeTrue();

        _mockRepository.Verify(r => r.GetByIdAsync(debtTitleId), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenDebtTitleDoesNotExist()
    {
        // Arrange
        var debtTitleId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(debtTitleId))
            .ReturnsAsync((DebtTitle?)null);

        // Act
        var result = await _service.DeleteAsync(debtTitleId);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();

        _mockRepository.Verify(r => r.GetByIdAsync(debtTitleId), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
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