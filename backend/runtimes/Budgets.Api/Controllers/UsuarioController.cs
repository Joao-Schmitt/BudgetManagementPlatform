using Budgets.Api.Contracts;
using Budgets.Api.Security;
using Budgets.Application.User.Interfaces;
using Budgets.Application.User.Models;
using Budgets.Domain.User.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateName(UpdateUserNameRequest request)
        {
            var result = await _usuarioService.UpdateNameAsync(
                User.GetUserId(),
                new UpdateUserNameArgs(request.Name));

            if (!result.Success)
                return BadRequest(result.Error);

            await RefreshAuthenticationAsync(result.Value!);

            return Ok(ToResponse(result.Value!));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEmail(UpdateUserEmailRequest request)
        {
            var result = await _usuarioService.UpdateEmailAsync(
                User.GetUserId(),
                new UpdateUserEmailArgs(request.Email, request.TwoFactorCode));

            if (!result.Success)
                return BadRequest(result.Error);

            await RefreshAuthenticationAsync(result.Value!);

            return Ok(ToResponse(result.Value!));
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePassword(UpdateUserPasswordRequest request)
        {
            var result = await _usuarioService.UpdatePasswordAsync(
                User.GetUserId(),
                new UpdateUserPasswordArgs(
                    request.CurrentPassword,
                    request.NewPassword,
                    request.TwoFactorCode));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }

        private async Task RefreshAuthenticationAsync(Usuario user)
        {
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                ClaimsHelper.Create(user),
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(30)
                });
        }

        private static object ToResponse(Usuario user)
        {
            return new
            {
                user.Id,
                user.Name,
                user.Email
            };
        }
    }
}
