namespace Budgets.Api.Contracts
{
    public class UpdateOrcamentoRequest
    {
        public Guid EstabelecimentoId { get; set; }
        public Guid ClienteId { get; set; }
        public Guid VendedorId { get; set; }
        public Guid UsuarioId { get; set; }
        public Guid TemplateOrcamentoId { get; set; }
        public string? Observacoes { get; set; }
        public IReadOnlyCollection<Guid> FormaPagamentoIds { get; set; } = [];
        public IReadOnlyCollection<OrcamentoItemRequest> Itens { get; set; } = [];
    }
}
