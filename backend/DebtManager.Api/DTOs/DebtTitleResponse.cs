namespace DebtManager.Api.DTOs;

/// <summary>
/// Resposta com dados do título de dívida
/// </summary>
public class DebtTitleResponse
{
    /// <summary>
    /// ID único do título
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Número do título
    /// </summary>
    public string TitleNumber { get; set; } = string.Empty;

    /// <summary>
    /// Valor original do título (soma de todas as parcelas)
    /// </summary>
    public decimal OriginalValue { get; set; }

    /// <summary>
    /// Valor atualizado com juros
    /// </summary>
    public decimal UpdatedValue { get; set; }

    /// <summary>
    /// Data de vencimento
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Taxa de juros por dia
    /// </summary>
    public decimal InterestRatePerDay { get; set; }

    /// <summary>
    /// Taxa de multa
    /// </summary>
    public decimal PenaltyRate { get; set; }

    /// <summary>
    /// Nome do devedor
    /// </summary>
    public string DebtorName { get; set; } = string.Empty;

    /// <summary>
    /// Documento do devedor
    /// </summary>
    public string DebtorDocument { get; set; } = string.Empty;

    /// <summary>
    /// Tipo do documento do devedor (CPF ou CNPJ)
    /// </summary>
    public string DebtorDocumentType { get; set; } = string.Empty;

    /// <summary>
    /// Data de criação
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Quantidade de parcelas
    /// </summary>
    public int InstallmentCount { get; set; }

    /// <summary>
    /// Dias em atraso (maior atraso entre todas as parcelas)
    /// </summary>
    public int DaysOverdue { get; set; }

    /// <summary>
    /// Indica se o título está em atraso
    /// </summary>
    public bool IsOverdue => DaysOverdue > 0;

    /// <summary>
    /// Lista de parcelas
    /// </summary>
    public List<InstallmentResponse> Installments { get; set; } = new();
}