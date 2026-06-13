
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
        Task<Result> ConfirmTwoFactorAsync(Guid userId, string code);
    }
}
