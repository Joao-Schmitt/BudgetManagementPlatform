using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Orcamento.Entities
{
    public class OrcamentoFormaPagamento : Entity
    {
        public Guid OrcamentoId { get; set; }
        public Guid FormaPagamentoId { get; set; }
        public Orcamento Orcamento { get; set; } = null!;
    }
}
