using Budgets.Domain.Email.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class FilaEmailAnexoConfiguration : IEntityTypeConfiguration<FilaEmailAnexo>
    {
        public void Configure(EntityTypeBuilder<FilaEmailAnexo> builder)
        {
            builder.ToTable("FilaEmailAnexo");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.NomeArquivo).HasMaxLength(255).IsRequired();
            builder.Property(x => x.TipoConteudo).HasMaxLength(150).IsRequired();
            builder.Property(x => x.Conteudo).HasColumnType("varbinary(max)").IsRequired();
        }
    }
}
