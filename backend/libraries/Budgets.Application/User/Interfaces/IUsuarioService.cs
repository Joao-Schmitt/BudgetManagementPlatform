using Budgets.Application.User.Models;
using Budgets.Domain.User.Entities;
using Budgets.Shared.Results;

namespace Budgets.Application.User.Interfaces
{
    public interface IUsuarioService
    {
        Task<Result<Usuario>> UpdateNameAsync(Guid userId, UpdateUserNameArgs args);
        Task<Result<Usuario>> UpdateEmailAsync(Guid userId, UpdateUserEmailArgs args);
        Task<Result> UpdatePasswordAsync(Guid userId, UpdateUserPasswordArgs args);
    }
}
