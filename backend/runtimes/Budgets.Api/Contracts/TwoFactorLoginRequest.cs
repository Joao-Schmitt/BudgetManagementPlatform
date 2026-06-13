namespace Budgets.Api.Contracts
{
    public sealed class TwoFactorLoginRequest
    {
        public string TwoFactorToken { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
