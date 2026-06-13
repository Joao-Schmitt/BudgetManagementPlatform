using Budgets.Api.Extensions;
using Budgets.Api.Handlers;
using Budgets.Infrastructure.IoC;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:51469")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("global", context =>
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var partitionKey = !string.IsNullOrWhiteSpace(userId)
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress}";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            });
    });
});

builder.Services.AddControllers();

builder.Services.AddCookieAuthentication();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();

builder.Services.AddDistributedMemoryCache();

builder.Services.AddDependencyInjection(builder.Configuration);

var app = builder.Build();

app.Map("/health", health =>
{
    health.Run(async context =>
    {
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync("API Online");
    });
});

app.Map("/session", (ClaimsPrincipal user) =>
{
    return Results.Ok(new
    {
        Id = user.FindFirstValue(ClaimTypes.NameIdentifier),
        Name = user.FindFirstValue(ClaimTypes.Name),
        Email = user.FindFirstValue(ClaimTypes.Email)
    });
})
.RequireAuthorization();


app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseCors("DefaultCors");

app.UseAuthorization();

app.MapControllers();

app.Run();
