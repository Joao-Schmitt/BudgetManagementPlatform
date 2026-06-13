using Microsoft.AspNetCore.Authentication.Cookies;

namespace Budgets.Api.Extensions
{
    public static class AuthenticationExtensions
    {
        public static IServiceCollection AddCookieAuthentication(this IServiceCollection services)
        {
            services
                .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "auth";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.None;
                    options.ExpireTimeSpan = TimeSpan.FromHours(6);
                    options.SlidingExpiration = true;
                    options.LoginPath = "/auth/unauthorized";
                    options.AccessDeniedPath = "/auth/forbidden";

                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };

                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                });

            services.AddAuthorization();

            return services;
        }

    }
}
