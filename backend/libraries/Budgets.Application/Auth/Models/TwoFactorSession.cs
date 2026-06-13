using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Budgets.Application.Auth.Models
{
    public sealed record TwoFactorSession(
        Guid UserId,
        DateTimeOffset CreatedAt
    );
}
