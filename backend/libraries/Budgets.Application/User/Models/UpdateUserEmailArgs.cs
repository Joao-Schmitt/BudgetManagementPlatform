namespace Budgets.Application.User.Models
{
    public sealed record UpdateUserEmailArgs(string Email, string? TwoFactorCode);
}
