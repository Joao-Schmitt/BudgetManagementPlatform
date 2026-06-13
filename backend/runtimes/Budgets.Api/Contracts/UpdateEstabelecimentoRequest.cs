namespace Budgets.Api.Contracts
{
    public class UpdateEstabelecimentoRequest
    {
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
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
        public string? LogoUrl { get; set; }
    }
}
