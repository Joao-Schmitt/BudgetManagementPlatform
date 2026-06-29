using Budgets.Domain.Email.Entities;
using Budgets.Domain.Email.Interfaces;
using Budgets.Domain.User.Entities;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class FilaEmailRepository(BudgetsDbContext context) : Repository<FilaEmail>(context), IFilaEmailRepository
    {
        public async Task<List<FilaEmail>> AtualizaSituacaoAsync(Expression<Func<FilaEmail, bool>> expression, FilaEmailSituacao situacao)
        {
            await context.Set<FilaEmail>()
                        .Where(expression)
                        .ExecuteUpdateAsync(x =>
                             x.SetProperty(p => p.Situacao, situacao));

            return await context.Set<FilaEmail>()
               .Where(expression)
               .AsNoTracking()
               .ToListAsync();
        }
    }
}
