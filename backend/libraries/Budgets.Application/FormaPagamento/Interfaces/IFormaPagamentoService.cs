using Budgets.Application.FormaPagamento.Models;
using Budgets.Shared.Results;
using FormaPagamentoEntity = Budgets.Domain.FormaPagamento.Entities.FormaPagamento;

namespace Budgets.Application.FormaPagamento.Interfaces
{
    public interface IFormaPagamentoService
    {
        Task<Result<FormaPagamentoEntity>> CreateAsync(CreateFormaPagamentoArgs args);
        Task<Result<IEnumerable<FormaPagamentoEntity>>> GetAllAsync();
        Task<Result<FormaPagamentoEntity>> GetByIdAsync(Guid id);
        Task<Result<FormaPagamentoEntity>> UpdateAsync(Guid id, UpdateFormaPagamentoArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
