using DebtManager.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DebtManager.Core.Infrastructure.Persistence;

/// <summary>
/// Contexto do Entity Framework para o DebtManager
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// DbSet para títulos de dívida
    /// </summary>
    public DbSet<DebtTitle> DebtTitles { get; set; }

    /// <summary>
    /// DbSet para parcelas
    /// </summary>
    public DbSet<Installment> Installments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da entidade DebtTitle
        modelBuilder.Entity<DebtTitle>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.TitleNumber)
                .HasMaxLength(50)
                .IsRequired();
            
            entity.HasIndex(e => e.TitleNumber)
                .IsUnique();
            
            entity.Property(e => e.OriginalValue)
                .HasColumnType("decimal(18,2)")
                .IsRequired();
            
            entity.Property(e => e.DueDate)
                .HasColumnType("datetime2")
                .IsRequired();
            
            entity.Property(e => e.InterestRatePerDay)
                .HasColumnType("decimal(5,4)")
                .IsRequired();
            
            entity.Property(e => e.PenaltyRate)
                .HasColumnType("decimal(5,4)")
                .IsRequired();
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            // Configuração do Value Object Debtor usando OwnsOne
            entity.OwnsOne(e => e.Debtor, debtor =>
            {
                debtor.Property(d => d.Name)
                    .HasColumnName("DebtorName")
                    .HasMaxLength(200)
                    .IsRequired();
                
                debtor.OwnsOne(d => d.Document, document =>
                {
                    document.Property(doc => doc.Value)
                        .HasColumnName("DebtorDocument")
                        .HasMaxLength(20)
                        .IsRequired();
                    
                    document.Property(doc => doc.Type)
                        .HasColumnName("DebtorDocumentType")
                        .HasConversion<string>()
                        .IsRequired();
                });
            });

            // Value Object Debtor agora é mapeado corretamente com OwnsOne

            // Relacionamento com Installments
            entity.HasMany(e => e.Installments)
                .WithOne(i => i.DebtTitle)
                .HasForeignKey(i => i.DebtTitleId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configuração da entidade Installment
        modelBuilder.Entity<Installment>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.InstallmentNumber)
                .IsRequired();
            
            entity.Property(e => e.Value)
                .HasColumnType("decimal(18,2)")
                .IsRequired();
            
            entity.Property(e => e.DueDate)
                .HasColumnType("datetime2")
                .IsRequired();
            
            entity.Property(e => e.IsPaid)
                .IsRequired();
            
            entity.Property(e => e.PaidAt)
                .HasColumnType("datetime2")
                .IsRequired(false);
            
            entity.Property(e => e.DebtTitleId)
                .IsRequired();
        });
    }
}