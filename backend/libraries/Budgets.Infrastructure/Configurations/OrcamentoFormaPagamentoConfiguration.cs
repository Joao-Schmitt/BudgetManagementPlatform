using Budgets.Domain.FormaPagamento.Entities;
using Budgets.Domain.Orcamento.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class OrcamentoFormaPagamentoConfiguration : IEntityTypeConfiguration<OrcamentoFormaPagamento>
    {
        public void Configure(EntityTypeBuilder<OrcamentoFormaPagamento> builder)
        {
            builder.ToTable("OrcamentoFormaPagamento");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.OrcamentoId).IsRequired();
            builder.Property(x => x.FormaPagamentoId).IsRequired();

            builder.HasOne(x => x.Orcamento)
                .WithMany(x => x.FormasPagamento)
                .HasForeignKey(x => x.OrcamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<FormaPagamento>()
                .WithMany()
                .HasForeignKey(x => x.FormaPagamentoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
