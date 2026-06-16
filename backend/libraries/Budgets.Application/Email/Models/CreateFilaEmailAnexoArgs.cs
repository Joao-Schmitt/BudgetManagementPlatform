namespace Budgets.Application.Email.Models
{
    public sealed record CreateFilaEmailAnexoArgs(
        string NomeArquivo,
        string TipoConteudo,
        byte[] Conteudo);
}
