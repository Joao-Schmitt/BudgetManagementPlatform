namespace Budgets.Application.Auth.Models
{
    public sealed record LoginArgs(
         string Email,
         string Password
    );
}
