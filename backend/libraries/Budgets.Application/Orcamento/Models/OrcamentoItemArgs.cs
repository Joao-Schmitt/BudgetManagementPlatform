namespace Budgets.Application.Orcamento.Models
{
    public sealed record OrcamentoItemArgs(
        Guid? ProdutoId,
        Guid? ServicoId,
        decimal Quantidade,
        decimal ValorUnitario);
}
