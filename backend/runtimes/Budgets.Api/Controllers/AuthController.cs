using Budgets.Api.Contracts;
using Budgets.Api.Security;
using Budgets.Application.Auth.Interfaces;
using Budgets.Application.Auth.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Budgets.Shared.Results;
using System.Security.Claims;
using Budgets.Domain.User.Entities;
using Microsoft.AspNetCore.Authorization;

namespace Budgets.Api.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.ValidateLoginAsync(new LoginArgs(

                request.Email,
                request.Password
            ));

            if (!result.Success)
                return BadRequest(result.Error);

            if (result.Value == null)
                return BadRequest("Falha ao carregar o usuário!");

            var user = result.Value;

            if (result.Value.TwoFactorEnabled)
            {
                var tempToken = await _authService.CreateTwoFactorSessionAsync(user.Id);

                return Ok(new
                {
                    requiresTwoFactor = true,
                    twoFactorToken = tempToken
                });
            }

            await Authenticate(ClaimsHelper.Create(user));    

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email
            });
        }

        [HttpPost]
        public async Task<IActionResult> LoginTwoFactor(TwoFactorLoginRequest request)
        {
            var result = await _authService.ValidateTwoFactorAsync(
                request.TwoFactorToken,
                request.Code
            );

            if (!result.Success)
                return BadRequest(result.Error);

            if (result.Value == null)
                return BadRequest("Falha ao carregar o usuário!");

            var user = result.Value;

            await Authenticate(ClaimsHelper.Create(user));

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email
            });
        }

        [HttpPost]
        public IActionResult CreateAccount(CreateAccountRequest request)
        {
            var result = _authService.CreateUser(new CreateAccountArgs(
                request.Name,
                request.Email,
                request.Password
            ));

            if (!result.Success)
                return BadRequest(result.Error);

            if (result.Value == null)
                return BadRequest("Falha ao carregar o usuário!");

            return Ok(new
            {
                result.Value.Id,
                result.Value.Name,
                result.Value.Email
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> EnableTwoFactor()
        {
            var result = await _authService.EnableTwoFactorAsync(User.GetUserId());

            if(!result.Success)
                return BadRequest(result.Error);

            if (result.Value == null)
                return BadRequest("Falha ao habiltiar a autenticação de 2 fatores");

            return Ok(new
            {
                result.Value.Secret,
                result.Value.OptAuthUrl
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> ConfirmTwoFactor([FromQuery]string code)
        {
            var result = await _authService.ConfirmTwoFactorAsync(
                User.GetUserId(),
                code
            );

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }

        #region Helpers
        private async Task Authenticate(ClaimsPrincipal claims)
        {
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                claims,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(6)
                }
            );
        }
        #endregion
    }
}
