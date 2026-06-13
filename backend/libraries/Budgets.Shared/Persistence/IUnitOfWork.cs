
namespace Budgets.Shared.Persistence
{
    public interface IUnitOfWork
    {
        int Commit();
        Task<int> CommitAsync(CancellationToken cancellationToken = default);

        Task RollbackAsync(CancellationToken cancellationToken = default);
    }
}
