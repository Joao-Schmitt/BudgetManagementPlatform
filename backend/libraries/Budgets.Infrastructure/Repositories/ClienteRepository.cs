using Budgets.Domain.Cliente.Entities;
using Budgets.Domain.Cliente.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class ClienteRepository(BudgetsDbContext context)
        : Repository<Cliente>(context), IClienteRepository
    {
    }
}
