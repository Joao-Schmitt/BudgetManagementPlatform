namespace Budgets.Api.Contracts
{
    public class CreateServicoRequest
    {
        public string? Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public decimal? Custo { get; set; }
    }
}
