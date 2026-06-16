using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Orcamento.Entities
{
    public class OrcamentoItem : Entity
    {
        public Guid OrcamentoId { get; set; }
        public Guid? ProdutoId { get; set; }
        public Guid? ServicoId { get; set; }
        public decimal Quantidade { get; set; }
        public decimal ValorUnitario { get; set; }
        public Orcamento Orcamento { get; set; } = null!;
    }
}
