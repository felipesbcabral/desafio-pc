using FluentValidation;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;

namespace DebtManager.Api.Validators;

public class CreateDebtTitleRequestValidator : AbstractValidator<CreateDebtTitleRequest>
{
    public CreateDebtTitleRequestValidator()
    {
        RuleFor(x => x.TitleNumber)
            .NotEmpty().WithMessage("Número do título é obrigatório")
            .Length(1, 50).WithMessage("Número do título deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.OriginalValue)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero")
            .When(x => x.OriginalValue.HasValue);

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Data de vencimento é obrigatória");

        RuleFor(x => x.InterestRatePerDay)
            .InclusiveBetween(0, 100).WithMessage("Taxa de juros deve estar entre 0 e 100");

        RuleFor(x => x.PenaltyRate)
            .InclusiveBetween(0, 100).WithMessage("Taxa de multa deve estar entre 0 e 100");

        RuleFor(x => x.DebtorName)
            .NotEmpty().WithMessage("Nome do devedor é obrigatório")
            .Length(2, 200).WithMessage("Nome deve ter entre 2 e 200 caracteres");

        RuleFor(x => x.DebtorDocument)
            .NotEmpty().WithMessage("Documento do devedor é obrigatório")
            .Must(BeValidDocument).WithMessage("Documento deve ser um CPF ou CNPJ válido");

        RuleFor(x => x.Installments)
            .NotEmpty().WithMessage("Pelo menos uma parcela é obrigatória")
            .Must(x => x.Count > 0).WithMessage("Deve haver pelo menos uma parcela");

        RuleForEach(x => x.Installments)
            .SetValidator(new InstallmentRequestValidator());
    }

    private static bool BeValidDocument(string? document)
    {
        return Document.IsValidDocument(document ?? string.Empty);
    }
}

public class InstallmentRequestValidator : AbstractValidator<InstallmentRequest>
{
    public InstallmentRequestValidator()
    {
        RuleFor(x => x.InstallmentNumber)
            .GreaterThan(0).WithMessage("Número da parcela deve ser maior que zero");

        RuleFor(x => x.Value)
            .GreaterThan(0).WithMessage("Valor da parcela deve ser maior que zero");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Data de vencimento da parcela é obrigatória");
    }
}