using FluentValidation;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;

namespace DebtManager.Core.Application.Validators;

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
            .GreaterThanOrEqualTo(0).WithMessage("Taxa de juros deve ser maior ou igual a zero")
            .LessThanOrEqualTo(1).WithMessage("Taxa de juros deve ser menor ou igual a 100%");

        RuleFor(x => x.PenaltyRate)
            .GreaterThanOrEqualTo(0).WithMessage("Taxa de multa deve ser maior ou igual a zero")
            .LessThanOrEqualTo(1).WithMessage("Taxa de multa deve ser menor ou igual a 100%");

        RuleFor(x => x.DebtorName)
            .NotEmpty().WithMessage("Nome do devedor é obrigatório")
            .Length(2, 100).WithMessage("Nome do devedor deve ter entre 2 e 100 caracteres");

        RuleFor(x => x.DebtorDocument)
            .NotEmpty().WithMessage("Documento do devedor é obrigatório")
            .Must(Document.IsValidDocument).WithMessage("Documento deve ser um CPF ou CNPJ válido");

        RuleFor(x => x.Installments)
            .NotEmpty().WithMessage("Pelo menos uma parcela deve ser informada")
            .Must(installments => installments.Count <= 100).WithMessage("Máximo de 100 parcelas permitidas");

        RuleForEach(x => x.Installments).SetValidator(new InstallmentRequestValidator());
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