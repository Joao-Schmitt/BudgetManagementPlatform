using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Cliente.Entities
{
    public class Cliente : Entity
    {
        public string Nome { get; set; } = string.Empty;
        public string? Documento { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? WhatsApp { get; set; }
        public string? Cep { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Uf { get; set; }
        public string? Observacao { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
