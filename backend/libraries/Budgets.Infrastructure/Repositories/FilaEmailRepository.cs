using Budgets.Domain.Email.Entities;
using Budgets.Domain.Email.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class FilaEmailRepository(BudgetsDbContext context)
        : Repository<FilaEmail>(context), IFilaEmailRepository
    {
    }
}
