using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;
using Budgets.Shared.Security;
using Microsoft.EntityFrameworkCore;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class UsuarioRefreshTokenRepository(BudgetsDbContext context) : Repository<UsuarioRefreshToken>(context), IUsuarioRefreshTokenRepository
    {
        public async Task<UsuarioRefreshToken?> GetByTokenAsync(string token)
        {
            var hash = TokenHelper.Hash(token);

            return await _getByToken(context, hash);
        }

        private static readonly Func<BudgetsDbContext, string, Task<UsuarioRefreshToken?>>
            _getByToken =
                EF.CompileAsyncQuery(
                    (BudgetsDbContext ctx, string hash) =>
                        ctx.Set<UsuarioRefreshToken>()
                            .FirstOrDefault(x => x.TokenHash == hash && x.IsActive)
                );
    }
}
