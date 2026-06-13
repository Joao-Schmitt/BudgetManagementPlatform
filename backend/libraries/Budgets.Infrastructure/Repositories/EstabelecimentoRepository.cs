using Budgets.Domain.Estabelecimento.Entities;
using Budgets.Domain.Estabelecimento.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class EstabelecimentoRepository(BudgetsDbContext context)
        : Repository<Estabelecimento>(context), IEstabelecimentoRepository
    {
    }
}
