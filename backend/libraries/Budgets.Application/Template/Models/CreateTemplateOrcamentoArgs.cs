namespace Budgets.Application.Template.Models
{
    public sealed record CreateTemplateOrcamentoArgs(
        string Titulo,
        string? Descricao,
        string Html
    );
}
