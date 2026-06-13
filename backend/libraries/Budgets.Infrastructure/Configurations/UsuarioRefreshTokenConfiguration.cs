using Budgets.Domain.User.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budgets.Infrastructure.Configurations
{
    public sealed class UsuarioRefreshTokenConfiguration : IEntityTypeConfiguration<UsuarioRefreshToken>
    {
        public void Configure(EntityTypeBuilder<UsuarioRefreshToken> builder)
        {
            builder.ToTable("UsuarioRefreshToken");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.TokenHash).HasMaxLength(512).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.ExpiresAt).IsRequired();
            builder.Property(x => x.RevokedAt);
            builder.Property(x => x.ReplacedByTokenHash).HasMaxLength(512);

            builder.Ignore(x => x.IsActive);

            builder.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(x => x.UserId);
        }
    }
}
