namespace Budgets.Application.Servico.Models
{
    public sealed record CreateServicoArgs(
        string? Codigo,
        string Nome,
        string? Descricao,
        decimal Valor,
        decimal? Custo
    );
}
