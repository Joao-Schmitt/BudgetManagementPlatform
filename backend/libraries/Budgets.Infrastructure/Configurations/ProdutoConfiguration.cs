using Budgets.Domain.Produto.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
    {
        public void Configure(EntityTypeBuilder<Produto> builder)
        {
            builder.ToTable("Produto");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Codigo).HasMaxLength(60);
            builder.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Unidade).HasMaxLength(20).HasDefaultValue("UN").IsRequired();
            builder.Property(x => x.ValorVenda).HasPrecision(18, 2).HasDefaultValue(0).IsRequired();
            builder.Property(x => x.Custo).HasPrecision(18, 2);
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();
        }
    }
}
