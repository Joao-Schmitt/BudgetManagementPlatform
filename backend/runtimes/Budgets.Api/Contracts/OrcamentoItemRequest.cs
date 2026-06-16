namespace Budgets.Api.Contracts
{
    public class OrcamentoItemRequest
    {
        public Guid? ProdutoId { get; set; }
        public Guid? ServicoId { get; set; }
        public decimal Quantidade { get; set; }
        public decimal ValorUnitario { get; set; }
    }
}
