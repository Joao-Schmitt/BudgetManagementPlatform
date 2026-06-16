
namespace Budgets.Application.Orcamento.Models
{
    public sealed record GenerateOrcamentoArgs(
          Domain.Estabelecimento.Entities.Estabelecimento Estabelecimento,
          Domain.Cliente.Entities.Cliente Cliente,
          Domain.Vendedor.Entities.Vendedor Vendedor,
          Domain.User.Entities.Usuario Usuario,
          Domain.Template.Entities.TemplateOrcamento Template,
          List<GenerateOrcamentoArgsPayments> FormasPagamento,
          List<GenerateOrcamentoArgsProduct> Produtos,
          List<GenerateOrcamentoArgsService> Servicos
      );

    public sealed record GenerateOrcamentoArgsPayments(
        Budgets.Domain.FormaPagamento.Entities.FormaPagamento FormasPagamentos,
        Budgets.Domain.Orcamento.Entities.OrcamentoFormaPagamento OrcamentoItem
    );

    public sealed record GenerateOrcamentoArgsProduct(
        Budgets.Domain.Produto.Entities.Produto Item,
        Budgets.Domain.Orcamento.Entities.OrcamentoItem OrcamentoItem
    );

    public sealed record GenerateOrcamentoArgsService(
        Budgets.Domain.Servico.Entities.Servico Servico,
        Budgets.Domain.Orcamento.Entities.OrcamentoItem OrcamentoItem
    );
}
