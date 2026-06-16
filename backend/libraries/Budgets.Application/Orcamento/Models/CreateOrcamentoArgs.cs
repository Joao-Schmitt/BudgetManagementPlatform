using Budgets.Domain.Estabelecimento.Entities;

namespace Budgets.Application.Orcamento.Models
{
    public sealed record CreateOrcamentoArgs(
        Guid EstabelecimentoId,
        Guid ClienteId,
        Guid VendedorId,
        Guid UsuarioId,
        Guid TemplateOrcamentoId,
        string? Observacoes,
        IReadOnlyCollection<Guid> FormaPagamentoIds,
        IReadOnlyCollection<OrcamentoItemArgs> Itens);


    
}
