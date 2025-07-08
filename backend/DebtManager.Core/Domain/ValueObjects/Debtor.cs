using System;

namespace DebtManager.Core.Domain.ValueObjects;

public record Debtor
{
    public string Name { get; init; }
    public Document Document { get; init; }

    private Debtor() 
    {
        Name = string.Empty;
        Document = new Document("11144477735");
    }

    public Debtor(string name, string document)
    {
        Name = name?.Trim() ?? string.Empty;
        Document = new Document(document);
    }

    public string DocumentType => Document.Type.ToString();
    public string FormattedDocument => Document.FormattedValue;

    public override string ToString()
    {
        return $"{Name} ({FormattedDocument})";
    }
}