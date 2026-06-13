namespace Budgets.Api.Contracts
{
    public class UpdateProdutoRequest
    {
        public string? Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string? Unidade { get; set; }
        public decimal ValorVenda { get; set; }
        public decimal? Custo { get; set; }
    }
}
