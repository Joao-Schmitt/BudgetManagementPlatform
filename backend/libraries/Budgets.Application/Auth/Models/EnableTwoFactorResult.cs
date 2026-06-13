
namespace Budgets.Application.Auth.Models
{
    public sealed record EnableTwoFactorResult(
       string Secret,
       string OptAuthUrl
    );
}
