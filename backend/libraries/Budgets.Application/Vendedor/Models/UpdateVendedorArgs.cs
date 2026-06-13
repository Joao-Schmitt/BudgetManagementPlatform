namespace Budgets.Application.Vendedor.Models
{
    public sealed record UpdateVendedorArgs(
        Guid EstabelecimentoId,
        Guid? UsuarioId,
        string Nome,
        string? Email,
        string? Telefone,
        decimal PercentualComissaoPadrao
    );
}
