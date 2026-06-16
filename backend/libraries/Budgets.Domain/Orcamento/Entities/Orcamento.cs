using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Orcamento.Entities
{
    public class Orcamento : Entity
    {
        public Guid EstabelecimentoId { get; set; }
        public Guid ClienteId { get; set; }
        public Guid VendedorId { get; set; }
        public Guid UsuarioId { get; set; }
        public Guid TemplateOrcamentoId { get; set; }
        public string Observacoes { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
        public ICollection<OrcamentoFormaPagamento> FormasPagamento { get; set; } = [];
        public ICollection<OrcamentoItem> Itens { get; set; } = [];
    }
}
