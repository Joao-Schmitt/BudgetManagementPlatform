using Budgets.Application.Vendedor.Models;
using Budgets.Shared.Results;
using VendedorEntity = Budgets.Domain.Vendedor.Entities.Vendedor;

namespace Budgets.Application.Vendedor.Interfaces
{
    public interface IVendedorService
    {
        Task<Result<VendedorEntity>> CreateAsync(CreateVendedorArgs args);
        Task<Result<IEnumerable<VendedorEntity>>> GetAllAsync();
        Task<Result<VendedorEntity>> GetByIdAsync(Guid id);
        Task<Result<VendedorEntity>> UpdateAsync(Guid id, UpdateVendedorArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
