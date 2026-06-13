using Budgets.Infrastructure.Context;
using Budgets.Shared.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Budgets.Infrastructure
{
    public sealed class UnitOfWork(BudgetsDbContext context) : IUnitOfWork
    {

        public int Commit()
        {
            return context.SaveChanges();
        }
        public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
        {
            return await context.SaveChangesAsync(cancellationToken);
        }

        public Task RollbackAsync(CancellationToken cancellationToken = default)
        {
            context.ChangeTracker.Clear();

            return Task.CompletedTask;
        }
    }
}
