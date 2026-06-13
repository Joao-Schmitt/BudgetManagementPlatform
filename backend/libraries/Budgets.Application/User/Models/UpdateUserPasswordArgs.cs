namespace Budgets.Application.User.Models
{
    public sealed record UpdateUserPasswordArgs(string CurrentPassword, string NewPassword, string? TwoFactorCode);
}
