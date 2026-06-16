using Budgets.Domain.Template.Entities;
using Budgets.Domain.Template.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class TemplateOrcamentoRepository(BudgetsDbContext context)
        : Repository<TemplateOrcamento>(context), ITemplateOrcamentoRepository
    {
    }
}
