using Budgets.Application.Cliente.Models;
using Budgets.Shared.Results;
using ClienteEntity = Budgets.Domain.Cliente.Entities.Cliente;

namespace Budgets.Application.Cliente.Interfaces
{
    public interface IClienteService
    {
        Task<Result<ClienteEntity>> CreateAsync(CreateClienteArgs args);
        Task<Result<IEnumerable<ClienteEntity>>> GetAllAsync();
        Task<Result<ClienteEntity>> GetByIdAsync(Guid id);
        Task<Result<ClienteEntity>> UpdateAsync(Guid id, UpdateClienteArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
