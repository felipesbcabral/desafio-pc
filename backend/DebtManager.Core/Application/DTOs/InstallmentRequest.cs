using System;
using System.ComponentModel.DataAnnotations;

namespace DebtManager.Core.Application.DTOs;

public class InstallmentRequest
{
    [Required(ErrorMessage = "Número da parcela é obrigatório.")]
    [Range(1, int.MaxValue, ErrorMessage = "Número da parcela deve ser maior que zero.")]
    public int InstallmentNumber { get; set; }

    [Required(ErrorMessage = "Valor da parcela é obrigatório.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor da parcela deve ser maior que zero.")]
    public decimal Value { get; set; }

    [Required(ErrorMessage = "Data de vencimento é obrigatória.")]
    public DateTime DueDate { get; set; }
}