namespace Budgets.Application.Servico.Models
{
    public sealed record UpdateServicoArgs(
        string? Codigo,
        string Nome,
        string? Descricao,
        decimal Valor,
        decimal? Custo
    );
}
