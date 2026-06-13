using Budgets.Application.Servico.Models;
using Budgets.Shared.Results;
using ServicoEntity = Budgets.Domain.Servico.Entities.Servico;

namespace Budgets.Application.Servico.Interfaces
{
    public interface IServicoService
    {
        Task<Result<ServicoEntity>> CreateAsync(CreateServicoArgs args);
        Task<Result<IEnumerable<ServicoEntity>>> GetAllAsync();
        Task<Result<ServicoEntity>> GetByIdAsync(Guid id);
        Task<Result<ServicoEntity>> UpdateAsync(Guid id, UpdateServicoArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
