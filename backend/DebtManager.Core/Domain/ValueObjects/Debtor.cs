using System;

namespace DebtManager.Core.Domain.ValueObjects;

public record Debtor
{
    public string Name { get; init; }
    public Document Document { get; init; }

    public Debtor(string name, string document)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome do devedor é obrigatório.");

        if (name.Length < 2)
            throw new ArgumentException("Nome do devedor deve ter pelo menos 2 caracteres.");

        if (name.Length > 200)
            throw new ArgumentException("Nome do devedor não pode ter mais de 200 caracteres.");

        Name = name.Trim();
        Document = new Document(document);
    }

    public string DocumentType => Document.Type.ToString();
    public string FormattedDocument => Document.FormattedValue;

    public override string ToString()
    {
        return $"{Name} ({FormattedDocument})";
    }
}