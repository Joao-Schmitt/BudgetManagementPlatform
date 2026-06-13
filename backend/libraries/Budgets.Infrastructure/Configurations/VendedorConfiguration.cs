using Budgets.Domain.User.Entities;
using Budgets.Domain.Estabelecimento.Entities;
using Budgets.Domain.Vendedor.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class VendedorConfiguration : IEntityTypeConfiguration<Vendedor>
    {
        public void Configure(EntityTypeBuilder<Vendedor> builder)
        {
            builder.ToTable("Vendedor");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Email).HasMaxLength(150);
            builder.Property(x => x.Telefone).HasMaxLength(30);
            builder.Property(x => x.PercentualComissaoPadrao).HasPrecision(9, 4).HasDefaultValue(0).IsRequired();
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();

            builder.HasOne<Estabelecimento>()
                .WithMany()
                .HasForeignKey(x => x.EstabelecimentoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
