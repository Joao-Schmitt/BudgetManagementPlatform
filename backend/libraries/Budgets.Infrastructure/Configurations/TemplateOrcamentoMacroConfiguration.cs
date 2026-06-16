using Budgets.Domain.Template.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class TemplateOrcamentoMacroConfiguration : IEntityTypeConfiguration<TemplateOrcamentoMacro>
    {
        public void Configure(EntityTypeBuilder<TemplateOrcamentoMacro> builder)
        {
            builder.ToTable("TemplateOrcamentoMacro");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Macro).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Descricao).HasMaxLength(500).IsRequired();
        }
    }
}
