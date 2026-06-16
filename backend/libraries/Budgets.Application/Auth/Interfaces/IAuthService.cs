
using Budgets.Application.Auth.Models;
using Budgets.Domain.User.Entities;
using Budgets.Shared.Results;

namespace Budgets.Application.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<Result<Usuario>> ValidateLoginAsync(LoginArgs args);
        Task<string> CreateTwoFactorSessionAsync(Guid userId);
        Task<Result<Usuario>> ValidateTwoFactorAsync(string token, string code);
        Result<Usuario> CreateUser(CreateAccountArgs args);
        Task<Result<EnableTwoFactorResult>> EnableTwoFactorAsync(Guid userId);
        Task<Result<Usuario>> ConfirmTwoFactorAsync(Guid userId, string code);
        Task<Result> DisableTwoFactorAsync(Guid userId, string code);
        Result SaveUserRefreshToken(Guid userId, string refreshTokenHash);
        Task<Result<Usuario>> GetUserByRefreshTokenAsync(string refreshToken);
        Result InvalidateRefreshToken(string refreshToken);
    }
}
