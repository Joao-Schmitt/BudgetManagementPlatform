namespace Budgets.Application.Produto.Models
{
    public sealed record CreateProdutoArgs(
        string? Codigo,
        string Nome,
        string? Descricao,
        string? Unidade,
        decimal ValorVenda,
        decimal? Custo
    );
}
