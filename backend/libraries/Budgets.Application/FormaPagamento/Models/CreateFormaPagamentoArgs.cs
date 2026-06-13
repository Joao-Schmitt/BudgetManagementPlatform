namespace Budgets.Application.FormaPagamento.Models
{
    public sealed record CreateFormaPagamentoArgs(
        string Nome,
        string Tipo
    );
}
