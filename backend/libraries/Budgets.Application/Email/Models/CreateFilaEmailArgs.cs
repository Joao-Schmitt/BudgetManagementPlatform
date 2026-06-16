namespace Budgets.Application.Email.Models
{
    public sealed record CreateFilaEmailArgs(
        string Destinatario,
        string Assunto,
        string Conteudo,
        IReadOnlyCollection<CreateFilaEmailAnexoArgs>? Anexos);
}
