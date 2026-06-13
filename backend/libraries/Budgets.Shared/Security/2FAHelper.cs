using OtpNet;

namespace Budgets.Shared.Security
{
    public class _2FAHelper
    {
        public static bool ValidateAuthenticatorCode(string secretBase32, string code)
        {
            if (string.IsNullOrWhiteSpace(secretBase32))
                return false;

            if (string.IsNullOrWhiteSpace(code))
                return false;

            code = code.Replace(" ", "").Trim();

            var secretBytes = Base32Encoding.ToBytes(secretBase32);

            var totp = new Totp(secretBytes);

            return totp.VerifyTotp(
                code,
                out _,
                new VerificationWindow(previous: 1, future: 1)
            );
        }
    }
}
