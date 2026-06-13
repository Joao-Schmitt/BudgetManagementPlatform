using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Budgets.Shared.Persistence
{
    public interface IRepository<TEntity> : IDisposable where TEntity : class
    {
        Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool readOnly = false);
        IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>> predicate, bool readOnly = false);
        Task<IEnumerable<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> predicate, bool readOnly = false);
        TEntity GetById(Guid id);
        Task<TEntity> GetByIdAsync(Guid id);
        void Create(TEntity obj);
        void Remove(TEntity obj);
        void Remove(Guid id);
        void RemoveAll(Expression<Func<TEntity, bool>> predicate);
        void Update(TEntity obj);
    }
}
