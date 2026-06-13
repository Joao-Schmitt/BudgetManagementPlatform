using Budgets.Domain.User.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace Budgets.Api.Security
{
    public static class ClaimsHelper
    {
        public static ClaimsPrincipal Create(Usuario user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Email, user.Email)
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme
            );

            return new ClaimsPrincipal(identity);
        }

        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(value, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido.");

            return userId;
        }
    }
}
