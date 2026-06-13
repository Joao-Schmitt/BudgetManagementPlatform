using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Vendedor.Entities
{
    public class Vendedor : Entity
    {
        public Guid EstabelecimentoId { get; set; }
        public Guid? UsuarioId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public decimal PercentualComissaoPadrao { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
