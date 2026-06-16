using Budgets.Domain.Orcamento.Entities;
using Budgets.Domain.Orcamento.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class OrcamentoRepository(BudgetsDbContext context)
        : Repository<Orcamento>(context), IOrcamentoRepository
    {
    }
}
