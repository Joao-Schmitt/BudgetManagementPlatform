namespace Budgets.Application.FormaPagamento.Models
{
    public sealed record UpdateFormaPagamentoArgs(
        string Nome,
        string Tipo
    );
}
