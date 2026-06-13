namespace Budgets.Application.Estabelecimento.Models
{
    public sealed record UpdateEstabelecimentoArgs(
        string RazaoSocial,
        string? NomeFantasia,
        string? Cnpj,
        string? InscricaoEstadual,
        string? Email,
        string? Telefone,
        string? WhatsApp,
        string? Cep,
        string? Logradouro,
        string? Numero,
        string? Complemento,
        string? Bairro,
        string? Cidade,
        string? Uf,
        string? LogoUrl
    );
}
