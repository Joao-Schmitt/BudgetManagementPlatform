namespace Budgets.Application.Produto.Models
{
    public sealed record UpdateProdutoArgs(
        string? Codigo,
        string Nome,
        string? Descricao,
        string? Unidade,
        decimal ValorVenda,
        decimal? Custo
    );
}
