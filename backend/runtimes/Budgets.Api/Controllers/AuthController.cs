using Budgets.Api.Contracts;
using Budgets.Api.Security;
using Budgets.Application.Auth.Interfaces;
using Budgets.Application.Auth.Models;
using Budgets.Domain.User.Entities;
using Budgets.Shared.Results;
using Budgets.Shared.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
                user.Email,
                user.TwoFactorEnabled
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
                user.Email,
                user.TwoFactorEnabled
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
                result.Value.Email,
                result.Value.TwoFactorEnabled
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

            await Authenticate(ClaimsHelper.Create(result.Value!));

            return Ok(new
            {
                result.Value!.Id,
                result.Value.Name,
                result.Value.Email,
                result.Value.TwoFactorEnabled
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> DisableTwoFactor([FromQuery]string code)
        {
            var result = await _authService.DisableTwoFactorAsync(
                User.GetUserId(),
                code
            );

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
                return Unauthorized();

            var userResult = await _authService.GetUserByRefreshTokenAsync(refreshToken);

            if (!userResult.Success || userResult.Value == null)
                return Unauthorized(userResult.Error);

            var claims = ClaimsHelper.Create(userResult.Value);

            await Authenticate(claims);

            var newRefreshToken = TokenHelper.GenerateToken();
            var newRefreshTokenHash = TokenHelper.Hash(refreshToken);

            _authService.SaveUserRefreshToken(claims.GetUserId(), newRefreshTokenHash);
            SetRefreshTokenCookie(Response, refreshToken);

            return Ok(new
            {
                userResult.Value.Id,
                userResult.Value.Name,
                userResult.Value.Email,
                userResult.Value.TwoFactorEnabled
            });
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (!string.IsNullOrWhiteSpace(refreshToken))
                _authService.InvalidateRefreshToken(refreshToken);

            await HttpContext.SignOutAsync();

            Response.Cookies.Delete("auth");
            Response.Cookies.Delete("refreshToken");

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
                    ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(30)
                }
            );

            var refreshToken = TokenHelper.GenerateToken();
            var refreshTokenHash = TokenHelper.Hash(refreshToken);

            _authService.SaveUserRefreshToken(claims.GetUserId(), refreshTokenHash);

            SetRefreshTokenCookie(Response, refreshToken);
        }

        private void SetRefreshTokenCookie(HttpResponse response, string refreshToken)
        {
            response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            });
        }
        #endregion
    }
}
