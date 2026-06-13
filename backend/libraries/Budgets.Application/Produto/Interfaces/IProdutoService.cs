using Budgets.Application.Produto.Models;
using Budgets.Shared.Results;
using ProdutoEntity = Budgets.Domain.Produto.Entities.Produto;

namespace Budgets.Application.Produto.Interfaces
{
    public interface IProdutoService
    {
        Task<Result<ProdutoEntity>> CreateAsync(CreateProdutoArgs args);
        Task<Result<IEnumerable<ProdutoEntity>>> GetAllAsync();
        Task<Result<ProdutoEntity>> GetByIdAsync(Guid id);
        Task<Result<ProdutoEntity>> UpdateAsync(Guid id, UpdateProdutoArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
