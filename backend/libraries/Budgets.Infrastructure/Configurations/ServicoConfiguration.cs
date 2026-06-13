using Budgets.Domain.Servico.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class ServicoConfiguration : IEntityTypeConfiguration<Servico>
    {
        public void Configure(EntityTypeBuilder<Servico> builder)
        {
            builder.ToTable("Servico");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Codigo).HasMaxLength(60);
            builder.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Valor).HasPrecision(18, 2).HasDefaultValue(0).IsRequired();
            builder.Property(x => x.Custo).HasPrecision(18, 2);
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();
        }
    }
}
