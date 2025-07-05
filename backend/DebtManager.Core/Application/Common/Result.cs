using FluentValidation.Results;

namespace DebtManager.Core.Application.Common;

public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public IList<ValidationFailure> Errors { get; private set; }
    public string? ErrorMessage { get; private set; }

    private Result(bool isSuccess, T? data, IList<ValidationFailure>? errors = null, string? errorMessage = null)
    {
        IsSuccess = isSuccess;
        Data = data;
        Errors = errors ?? new List<ValidationFailure>();
        ErrorMessage = errorMessage;
    }

    public static Result<T> Success(T data)
    {
        return new Result<T>(true, data);
    }

    public static Result<T> Failure(IList<ValidationFailure> errors)
    {
        return new Result<T>(false, default, errors);
    }

    public static Result<T> Failure(string errorMessage)
    {
        return new Result<T>(false, default, null, errorMessage);
    }
}

public class Result
{
    public bool IsSuccess { get; private set; }
    public IList<ValidationFailure> Errors { get; private set; }
    public string? ErrorMessage { get; private set; }

    private Result(bool isSuccess, IList<ValidationFailure>? errors = null, string? errorMessage = null)
    {
        IsSuccess = isSuccess;
        Errors = errors ?? new List<ValidationFailure>();
        ErrorMessage = errorMessage;
    }

    public static Result Success()
    {
        return new Result(true);
    }

    public static Result Failure(IList<ValidationFailure> errors)
    {
        return new Result(false, errors);
    }

    public static Result Failure(string errorMessage)
    {
        return new Result(false, null, errorMessage);
    }
}