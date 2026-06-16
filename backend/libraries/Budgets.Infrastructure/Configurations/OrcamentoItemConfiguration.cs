using Budgets.Domain.Orcamento.Entities;
using Budgets.Domain.Produto.Entities;
using Budgets.Domain.Servico.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class OrcamentoItemConfiguration : IEntityTypeConfiguration<OrcamentoItem>
    {
        public void Configure(EntityTypeBuilder<OrcamentoItem> builder)
        {
            builder.ToTable("OrcamentoItem");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.OrcamentoId).IsRequired();
            builder.Property(x => x.Quantidade).HasPrecision(18, 4).HasDefaultValue(1m).IsRequired();
            builder.Property(x => x.ValorUnitario).HasPrecision(18, 2).HasDefaultValue(0m).IsRequired();

            builder.HasOne(x => x.Orcamento)
                .WithMany(x => x.Itens)
                .HasForeignKey(x => x.OrcamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Produto>()
                .WithMany()
                .HasForeignKey(x => x.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Servico>()
                .WithMany()
                .HasForeignKey(x => x.ServicoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
