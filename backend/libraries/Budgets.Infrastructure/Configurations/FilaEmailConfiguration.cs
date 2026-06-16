using Budgets.Domain.Email.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class FilaEmailConfiguration : IEntityTypeConfiguration<FilaEmail>
    {
        public void Configure(EntityTypeBuilder<FilaEmail> builder)
        {
            builder.ToTable("FilaEmail");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Destinatario).HasMaxLength(320).IsRequired();
            builder.Property(x => x.Assunto).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Conteudo).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(x => x.Situacao).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();

            builder.HasMany(x => x.Anexos)
                .WithOne(x => x.FilaEmail)
                .HasForeignKey(x => x.FilaEmailId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
