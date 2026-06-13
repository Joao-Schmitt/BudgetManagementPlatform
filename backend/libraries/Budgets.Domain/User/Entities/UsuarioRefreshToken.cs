using Budgets.Shared.Abstractions;

namespace Budgets.Domain.User.Entities
{
    public class UsuarioRefreshToken : Entity
    {
        public Guid UserId { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }
        public bool IsActive => RevokedAt == null && ExpiresAt > DateTimeOffset.UtcNow;
    }
}
