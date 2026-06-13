using Budgets.Domain.Vendedor.Entities;
using Budgets.Domain.Vendedor.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class VendedorRepository(BudgetsDbContext context)
        : Repository<Vendedor>(context), IVendedorRepository
    {
    }
}
