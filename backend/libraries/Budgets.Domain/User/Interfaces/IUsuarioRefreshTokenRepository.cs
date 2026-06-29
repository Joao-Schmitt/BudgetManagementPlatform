using Budgets.Domain.User.Entities;
using Budgets.Shared.Persistence;

namespace Budgets.Domain.User.Interfaces
{
    public interface IUsuarioRefreshTokenRepository : IRepository<UsuarioRefreshToken>
    {
        Task<UsuarioRefreshToken?> GetByTokenAsync(string token);
    }
}
