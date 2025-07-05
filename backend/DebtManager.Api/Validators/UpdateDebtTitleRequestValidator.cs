using FluentValidation;
using DebtManager.Core.Application.DTOs;

namespace DebtManager.Api.Validators;

public class UpdateDebtTitleRequestValidator : AbstractValidator<UpdateDebtTitleRequest>
{
    public UpdateDebtTitleRequestValidator()
    {
        RuleFor(x => x.TitleNumber)
            .NotEmpty().WithMessage("Número do título é obrigatório")
            .MaximumLength(50).WithMessage("Número do título deve ter no máximo 50 caracteres");

        RuleFor(x => x.OriginalValue)
            .GreaterThan(0).WithMessage("Valor original deve ser maior que zero");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Data de vencimento é obrigatória");

        RuleFor(x => x.InterestRatePerDay)
            .GreaterThanOrEqualTo(0).WithMessage("Taxa de juros deve ser maior ou igual a zero");

        RuleFor(x => x.PenaltyRate)
            .GreaterThanOrEqualTo(0).WithMessage("Taxa de multa deve ser maior ou igual a zero");

        RuleFor(x => x.DebtorName)
            .NotEmpty().WithMessage("Nome do devedor é obrigatório")
            .MaximumLength(200).WithMessage("Nome do devedor deve ter no máximo 200 caracteres");

        RuleFor(x => x.DebtorDocument)
            .NotEmpty().WithMessage("Documento do devedor é obrigatório")
            .Must(BeValidDocument).WithMessage("Documento deve ser um CPF ou CNPJ válido");
    }

    private static bool BeValidDocument(string? document)
    {
        if (string.IsNullOrWhiteSpace(document))
            return false;

        // Remove caracteres não numéricos
        var cleanDocument = new string(document.Where(char.IsDigit).ToArray());

        // Valida CPF (11 dígitos) ou CNPJ (14 dígitos)
        return cleanDocument.Length == 11 || cleanDocument.Length == 14;
    }
}