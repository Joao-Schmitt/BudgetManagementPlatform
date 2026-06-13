using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class UsuarioRepository(BudgetsDbContext context) : Repository<Usuario>(context), IUsuarioRepository
    {
        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToUpperInvariant();

            return await FirstOrDefaultAsync(
                x => x.Email.Trim().ToUpper() == normalizedEmail,
                readOnly: true);
        }
    }
}
