using Budgets.Domain.Cliente.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
    {
        public void Configure(EntityTypeBuilder<Cliente> builder)
        {
            builder.ToTable("Cliente");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Documento).HasMaxLength(20);
            builder.Property(x => x.Email).HasMaxLength(150);
            builder.Property(x => x.Telefone).HasMaxLength(30);
            builder.Property(x => x.WhatsApp).HasMaxLength(30);
            builder.Property(x => x.Cep).HasMaxLength(15);
            builder.Property(x => x.Logradouro).HasMaxLength(200);
            builder.Property(x => x.Numero).HasMaxLength(30);
            builder.Property(x => x.Complemento).HasMaxLength(100);
            builder.Property(x => x.Bairro).HasMaxLength(100);
            builder.Property(x => x.Cidade).HasMaxLength(100);
            builder.Property(x => x.Uf).HasMaxLength(2).IsFixedLength();
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();
        }
    }
}
