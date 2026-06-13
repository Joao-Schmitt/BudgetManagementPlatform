using Budgets.Application.Estabelecimento.Models;
using Budgets.Shared.Results;
using EstabelecimentoEntity = Budgets.Domain.Estabelecimento.Entities.Estabelecimento;

namespace Budgets.Application.Estabelecimento.Interfaces
{
    public interface IEstabelecimentoService
    {
        Task<Result<EstabelecimentoEntity>> CreateAsync(CreateEstabelecimentoArgs args);
        Task<Result<IEnumerable<EstabelecimentoEntity>>> GetAllAsync();
        Task<Result<EstabelecimentoEntity>> GetByIdAsync(Guid id);
        Task<Result<EstabelecimentoEntity>> UpdateAsync(Guid id, UpdateEstabelecimentoArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
