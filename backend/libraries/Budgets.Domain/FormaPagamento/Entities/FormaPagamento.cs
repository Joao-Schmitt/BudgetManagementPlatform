using Budgets.Shared.Abstractions;

namespace Budgets.Domain.FormaPagamento.Entities
{
    public class FormaPagamento : Entity
    {
        public string Nome { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
