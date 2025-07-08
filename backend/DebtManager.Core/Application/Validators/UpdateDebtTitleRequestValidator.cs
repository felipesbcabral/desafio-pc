using FluentValidation;
using DebtManager.Core.Application.DTOs;
using DebtManager.Core.Domain.ValueObjects;

namespace DebtManager.Core.Application.Validators;

public class UpdateDebtTitleRequestValidator : AbstractValidator<UpdateDebtTitleRequest>
{
    public UpdateDebtTitleRequestValidator()
    {
        RuleFor(x => x.TitleNumber)
            .NotEmpty().WithMessage("Número do título é obrigatório")
            .Length(1, 50).WithMessage("Número do título deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.OriginalValue)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

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
            .Length(2, 200).WithMessage("Nome do devedor deve ter entre 2 e 200 caracteres");

        RuleFor(x => x.DebtorDocument)
            .Must(doc => string.IsNullOrEmpty(doc) || Document.IsValidDocument(doc))
            .WithMessage("Documento deve ser um CPF ou CNPJ válido")
            .When(x => !string.IsNullOrEmpty(x.DebtorDocument));
    }
}