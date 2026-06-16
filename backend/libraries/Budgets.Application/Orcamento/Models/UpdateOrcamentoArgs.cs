namespace Budgets.Application.Orcamento.Models
{
    public sealed record UpdateOrcamentoArgs(
        Guid EstabelecimentoId,
        Guid ClienteId,
        Guid VendedorId,
        Guid UsuarioId,
        Guid TemplateOrcamentoId,
        string? Observacoes,
        IReadOnlyCollection<Guid> FormaPagamentoIds,
        IReadOnlyCollection<OrcamentoItemArgs> Itens);
}
