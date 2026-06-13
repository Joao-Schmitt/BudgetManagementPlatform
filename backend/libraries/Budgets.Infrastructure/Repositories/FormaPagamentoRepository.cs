using Budgets.Domain.FormaPagamento.Entities;
using Budgets.Domain.FormaPagamento.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class FormaPagamentoRepository(BudgetsDbContext context)
        : Repository<FormaPagamento>(context), IFormaPagamentoRepository
    {
    }
}
