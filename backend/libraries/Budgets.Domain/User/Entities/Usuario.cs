using Budgets.Shared.Abstractions;

namespace Budgets.Domain.User.Entities
{
    public class Usuario : Entity
    {
        public string Name { get; set; } = string.Empty;    
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string TwoFactorSecret { get; set; } = string.Empty;
        public bool TwoFactorEnabled { get; set; }
        public DateTimeOffset TwoFactorEnabledAt { get; set; }
        public bool Ativo { get; set; }
    }
}
