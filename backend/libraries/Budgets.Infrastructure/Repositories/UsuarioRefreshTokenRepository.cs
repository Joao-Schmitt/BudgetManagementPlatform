using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;
using Budgets.Shared.Security;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class UsuarioRefreshTokenRepository(BudgetsDbContext context) : Repository<UsuarioRefreshToken>(context), IUsuarioRefreshTokenRepository
    {
        public UsuarioRefreshToken? GetByToken(string token)
        {
            var hash = TokenHelper.Hash(token);
            return GetAll(x => x.TokenHash == hash)
                  .ToList()
                  .Where(x => x.IsActive)
                  .OrderByDescending(y => y.RevokedAt)
                  .FirstOrDefault();

        }
    }
}
