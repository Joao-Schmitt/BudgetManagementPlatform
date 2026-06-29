using Budgets.Domain.Email.Entities;
using Budgets.Shared.Abstractions;
using Budgets.Shared.Persistence;
using System.Linq.Expressions;

namespace Budgets.Domain.Email.Interfaces
{
    public interface IFilaEmailRepository : IRepository<FilaEmail>
    {
        Task<List<FilaEmail>> AtualizaSituacaoAsync(Expression<Func<FilaEmail, bool>> expression, FilaEmailSituacao situacao);
    }
}
