using Budgets.Domain.Template.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class TemplateOrcamentoConfiguration : IEntityTypeConfiguration<TemplateOrcamento>
    {
        public void Configure(EntityTypeBuilder<TemplateOrcamento> builder)
        {
            builder.ToTable("TemplateOrcamento");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Descricao).HasMaxLength(500);
            builder.Property(x => x.Html).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(x => x.Ativo).HasDefaultValue(true).IsRequired();
            builder.Property(x => x.CriadoEm).IsRequired();
        }
    }
}
