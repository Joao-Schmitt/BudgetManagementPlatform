using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Template.Entities
{
    public class TemplateOrcamentoMacro : Entity
    {
        public string Macro { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
    }
}
