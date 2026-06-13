namespace Budgets.Api.Contracts
{
    public class CreateFormaPagamentoRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
    }
}
