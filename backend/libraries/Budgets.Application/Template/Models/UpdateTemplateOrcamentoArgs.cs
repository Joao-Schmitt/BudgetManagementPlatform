namespace Budgets.Application.Template.Models
{
    public sealed record UpdateTemplateOrcamentoArgs(
        string Titulo,
        string? Descricao,
        string Html
    );
}
