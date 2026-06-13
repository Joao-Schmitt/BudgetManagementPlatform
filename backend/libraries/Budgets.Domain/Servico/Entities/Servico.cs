using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Servico.Entities
{
    public class Servico : Entity
    {
        public string? Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public decimal? Custo { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
