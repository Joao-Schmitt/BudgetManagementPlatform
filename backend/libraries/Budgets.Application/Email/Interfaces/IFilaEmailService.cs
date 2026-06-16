using Budgets.Application.Email.Models;
using Budgets.Shared.Results;
using FilaEmailEntity = Budgets.Domain.Email.Entities.FilaEmail;

namespace Budgets.Application.Email.Interfaces
{
    public interface IFilaEmailService
    {
        Task<Result<FilaEmailEntity>> CreateAsync(CreateFilaEmailArgs args);
        Task<Result<IEnumerable<FilaEmailEntity>>> GetAllAsync();
        Task<Result<IEnumerable<FilaEmailEntity>>> GetBySituacaoAsync(Budgets.Domain.Email.Entities.FilaEmailSituacao situacao);
        Task<Result<FilaEmailEntity>> GetByIdAsync(Guid id);
        Task ProcessPendingAsync(CancellationToken cancellationToken = default);
    }
}
