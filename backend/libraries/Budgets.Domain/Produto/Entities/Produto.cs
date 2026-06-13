using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Produto.Entities
{
    public class Produto : Entity
    {
        public string? Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string Unidade { get; set; } = "UN";
        public decimal ValorVenda { get; set; }
        public decimal? Custo { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
