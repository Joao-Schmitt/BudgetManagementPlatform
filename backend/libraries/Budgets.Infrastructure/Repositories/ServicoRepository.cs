using Budgets.Domain.Servico.Entities;
using Budgets.Domain.Servico.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class ServicoRepository(BudgetsDbContext context)
        : Repository<Servico>(context), IServicoRepository
    {
    }
}
