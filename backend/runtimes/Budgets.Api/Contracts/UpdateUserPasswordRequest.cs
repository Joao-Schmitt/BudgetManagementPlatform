namespace Budgets.Api.Contracts
{
    public sealed class UpdateUserPasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string? TwoFactorCode { get; set; }
    }
}
