using System;
using System.Text.RegularExpressions;

namespace DebtManager.Core.Domain.ValueObjects;

public record Document
{
    public string Value { get; init; }
    public DocumentType Type { get; init; }

    public Document(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Documento não pode ser vazio.");

        var cleanValue = CleanDocument(value);
        
        if (IsValidCpf(cleanValue))
        {
            Value = cleanValue;
            Type = DocumentType.CPF;
        }
        else if (IsValidCnpj(cleanValue))
        {
            Value = cleanValue;
            Type = DocumentType.CNPJ;
        }
        else
        {
            throw new ArgumentException("Documento inválido. Deve ser um CPF ou CNPJ válido.");
        }
    }

    public string FormattedValue => Type switch
    {
        DocumentType.CPF => FormatCpf(Value),
        DocumentType.CNPJ => FormatCnpj(Value),
        _ => Value
    };

    private static string CleanDocument(string document)
    {
        return Regex.Replace(document, @"[^0-9]", "");
    }

    private static bool IsValidCpf(string cpf)
    {
        if (cpf.Length != 11 || cpf.All(c => c == cpf[0]))
            return false;

        var digits = cpf.Select(c => int.Parse(c.ToString())).ToArray();
        
        // Primeiro dígito verificador
        var sum = 0;
        for (int i = 0; i < 9; i++)
            sum += digits[i] * (10 - i);
        
        var firstDigit = (sum * 10) % 11;
        if (firstDigit == 10) firstDigit = 0;
        
        if (digits[9] != firstDigit)
            return false;
        
        // Segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++)
            sum += digits[i] * (11 - i);
        
        var secondDigit = (sum * 10) % 11;
        if (secondDigit == 10) secondDigit = 0;
        
        return digits[10] == secondDigit;
    }

    private static bool IsValidCnpj(string cnpj)
    {
        if (cnpj.Length != 14 || cnpj.All(c => c == cnpj[0]))
            return false;

        var digits = cnpj.Select(c => int.Parse(c.ToString())).ToArray();
        
        // Primeiro dígito verificador
        var multipliers1 = new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var sum = 0;
        for (int i = 0; i < 12; i++)
            sum += digits[i] * multipliers1[i];
        
        var remainder = sum % 11;
        var firstDigit = remainder < 2 ? 0 : 11 - remainder;
        
        if (digits[12] != firstDigit)
            return false;
        
        // Segundo dígito verificador
        var multipliers2 = new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        sum = 0;
        for (int i = 0; i < 13; i++)
            sum += digits[i] * multipliers2[i];
        
        remainder = sum % 11;
        var secondDigit = remainder < 2 ? 0 : 11 - remainder;
        
        return digits[13] == secondDigit;
    }

    private static string FormatCpf(string cpf)
    {
        return $"{cpf.Substring(0, 3)}.{cpf.Substring(3, 3)}.{cpf.Substring(6, 3)}-{cpf.Substring(9, 2)}";
    }

    private static string FormatCnpj(string cnpj)
    {
        return $"{cnpj.Substring(0, 2)}.{cnpj.Substring(2, 3)}.{cnpj.Substring(5, 3)}/{cnpj.Substring(8, 4)}-{cnpj.Substring(12, 2)}";
    }
}

public enum DocumentType
{
    CPF,
    CNPJ
}