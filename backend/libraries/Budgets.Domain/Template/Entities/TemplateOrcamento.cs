using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Template.Entities
{
    public class TemplateOrcamento : Entity
    {
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string Html { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
