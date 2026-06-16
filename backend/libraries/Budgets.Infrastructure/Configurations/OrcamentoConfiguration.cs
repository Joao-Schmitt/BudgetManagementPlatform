using Budgets.Domain.Cliente.Entities;
using Budgets.Domain.Estabelecimento.Entities;
using Budgets.Domain.Orcamento.Entities;
using Budgets.Domain.Template.Entities;
using Budgets.Domain.User.Entities;
using Budgets.Domain.Vendedor.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class OrcamentoConfiguration : IEntityTypeConfiguration<Orcamento>
    {
        public void Configure(EntityTypeBuilder<Orcamento> builder)
        {
            builder.ToTable("Orcamento");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Observacoes).HasColumnType("nvarchar(max)");
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();

            builder.HasOne<Estabelecimento>()
                .WithMany()
                .HasForeignKey(x => x.EstabelecimentoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Cliente>()
                .WithMany()
                .HasForeignKey(x => x.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Vendedor>()
                .WithMany()
                .HasForeignKey(x => x.VendedorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<TemplateOrcamento>()
                .WithMany()
                .HasForeignKey(x => x.TemplateOrcamentoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
