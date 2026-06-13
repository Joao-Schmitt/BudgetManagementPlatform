using Budgets.Infrastructure.Context;
using Budgets.Shared.Abstractions;
using Budgets.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Budgets.Infrastructure.Repositories.Abstract
{
    public abstract class Repository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        private readonly BudgetsDbContext _context;
        private readonly DbSet<TEntity> _db;

        public Repository(BudgetsDbContext context)
        {
            _context = context;
            _db = context.Set<TEntity>();
        }

        public virtual IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>> predicate, bool readOnly = false)
        {
            if (readOnly) return _db.Where(predicate).AsNoTracking().AsQueryable();
            return _db.Where(predicate).AsQueryable();
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> predicate, bool readOnly = false)
        {
            if (readOnly) return await _db.Where(predicate).AsNoTracking().ToListAsync();
            return await _db.Where(predicate).ToListAsync();
        }

        public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool readOnly = false)
        {
            var query = _db.Where(predicate);

            if (readOnly)
                query = query.AsNoTracking();

            return await query.FirstOrDefaultAsync();
        }

        public virtual TEntity GetById(Guid id) => _db.Find(id);
        public async Task<TEntity> GetByIdAsync(Guid id) => await _db.FindAsync(id);

        public virtual void Create(TEntity obj) => _db.Add(obj);
        public virtual void Update(TEntity obj) => _db.Update(obj);
        public virtual void Remove(TEntity obj) => _db.Remove(obj);
        public virtual void Remove(Guid id) => _db.Remove(GetById(id));
        public virtual void RemoveAll(Expression<Func<TEntity, bool>> predicate)
        {
            _db.RemoveRange(GetAll(predicate).ToList());
        }

        public void Dispose() => GC.SuppressFinalize(this);
    }
}
