using Budgets.Shared.Results;
using FilaEmailEntity = Budgets.Domain.Email.Entities.FilaEmail;

namespace Budgets.Application.Email.Interfaces
{
    public interface IEmailQueueSender
    {
        Task<Result> SendAsync(FilaEmailEntity filaEmail, CancellationToken cancellationToken = default);
    }
}
