namespace Budgets.Application.Cliente.Models
{
    public sealed record UpdateClienteArgs(
        string Nome,
        string? Documento,
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
        string? Observacao
    );
}
