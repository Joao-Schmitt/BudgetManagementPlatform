using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Budgets.Infrastructure.Context
{
    public class BudgetsDbContext(DbContextOptions<BudgetsDbContext> options) : DbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(BudgetsDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}
