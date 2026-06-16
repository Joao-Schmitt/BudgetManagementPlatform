namespace Budgets.Api.Contracts
{
    public class CreateTemplateOrcamentoRequest
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string Html { get; set; } = string.Empty;
    }
}
