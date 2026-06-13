namespace Budgets.Api.Contracts
{
    public class CreateVendedorRequest
    {
        public Guid EstabelecimentoId { get; set; }
        public Guid? UsuarioId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public decimal PercentualComissaoPadrao { get; set; }
    }
}
