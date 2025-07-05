namespace DebtManager.Core.Domain.Exceptions;

public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
    protected DomainException(string message, Exception innerException) : base(message, innerException) { }
}

public class DebtTitleNotFoundException : DomainException
{
    public DebtTitleNotFoundException(Guid id) 
        : base($"Título de dívida com ID {id} não foi encontrado.") { }
}

public class InvalidDebtTitleDataException : DomainException
{
    public InvalidDebtTitleDataException(string message) : base(message) { }
}

public class DebtorValidationException : DomainException
{
    public DebtorValidationException(string message) : base(message) { }
}

public class InstallmentValidationException : DomainException
{
    public InstallmentValidationException(string message) : base(message) { }
}