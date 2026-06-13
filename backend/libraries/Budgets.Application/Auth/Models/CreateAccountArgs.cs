namespace Budgets.Application.Auth.Models
{
    public sealed record CreateAccountArgs(
        string Name,
        string Email,
        string Password
    );
}
