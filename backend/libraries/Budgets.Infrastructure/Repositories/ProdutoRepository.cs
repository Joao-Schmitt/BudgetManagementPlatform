using Budgets.Domain.Produto.Entities;
using Budgets.Domain.Produto.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class ProdutoRepository(BudgetsDbContext context)
        : Repository<Produto>(context), IProdutoRepository
    {
    }
}
