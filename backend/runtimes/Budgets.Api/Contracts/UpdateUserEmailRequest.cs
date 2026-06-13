namespace Budgets.Api.Contracts
{
    public sealed class UpdateUserEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? TwoFactorCode { get; set; }
    }
}
