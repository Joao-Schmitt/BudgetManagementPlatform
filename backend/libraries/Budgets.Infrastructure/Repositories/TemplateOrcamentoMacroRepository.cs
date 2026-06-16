using Budgets.Domain.Template.Entities;
using Budgets.Domain.Template.Interfaces;
using Budgets.Infrastructure.Context;
using Budgets.Infrastructure.Repositories.Abstract;

namespace Budgets.Infrastructure.Repositories
{
    public sealed class TemplateOrcamentoMacroRepository(BudgetsDbContext context)
        : Repository<TemplateOrcamentoMacro>(context), ITemplateOrcamentoMacroRepository
    {
    }
}
