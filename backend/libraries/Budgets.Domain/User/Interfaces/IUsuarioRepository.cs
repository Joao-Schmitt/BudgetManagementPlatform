using Budgets.Shared.Persistence;

namespace Budgets.Domain.User.Interfaces
{
    public interface IUsuarioRepository : IRepository<Entities.Usuario>
    {
        Task<Entities.Usuario> GetByEmailAsync(string email);
    }
}
