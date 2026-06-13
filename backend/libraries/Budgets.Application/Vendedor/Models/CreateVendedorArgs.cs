namespace Budgets.Application.Vendedor.Models
{
    public sealed record CreateVendedorArgs(
        Guid EstabelecimentoId,
        Guid? UsuarioId,
        string Nome,
        string? Email,
        string? Telefone,
        decimal PercentualComissaoPadrao
    );
}
