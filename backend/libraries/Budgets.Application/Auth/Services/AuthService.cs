using Budgets.Application.Auth.Interfaces;
using Budgets.Application.Auth.Models;
using Budgets.Application.Security.Interfaces;
using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using Budgets.Shared.Security;
using Microsoft.Extensions.Caching.Distributed;
using OtpNet;
using System.Security.Cryptography;
using System.Text.Json;

namespace Budgets.Application.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IDistributedCache _cache;
        private readonly IUsuarioRefreshTokenRepository _usuarioRefreshTokenRepository;
        private readonly IUnitOfWork _uow;
        public AuthService(IUnitOfWork uow, IDistributedCache cache, IUsuarioRepository userRepository, IPasswordService passwordService, IUsuarioRefreshTokenRepository usuarioRefreshTokenRepository)
        {
            _uow = uow;
            _cache = cache;
            _userRepository = userRepository;   
            _passwordService = passwordService;
            _usuarioRefreshTokenRepository = usuarioRefreshTokenRepository;
        }
        public async Task<Result<Usuario>> ValidateLoginAsync(LoginArgs args)
        {
            if (args is null)
                return Result<Usuario>.Fail("Argumentos inválidos!");

            if (string.IsNullOrWhiteSpace(args.Email) || string.IsNullOrWhiteSpace(args.Password))
                return Result<Usuario>.Fail("Credenciais inválidas!");

            var user = await _userRepository.GetByEmailAsync(args.Email);

            if(user is null)
                return Result<Usuario>.Fail("Credenciais inválidas!");

            if(!_passwordService.Verify(args.Password, user.Password))
                return Result<Usuario>.Fail("Credenciais inválidas!");

            if(!user.Ativo)
                return Result<Usuario>.Fail("Usuário inativo.");

            return Result<Usuario>.Ok(user);
        }

        public async Task<string> CreateTwoFactorSessionAsync(Guid userId)
        {
            var rawToken = TokenHelper.GenerateTokenHex();
            var tokenHash = TokenHelper.Hash(rawToken);

            var session = new TwoFactorSession(userId, DateTimeOffset.UtcNow);

            var json = JsonSerializer.Serialize(session);

            await _cache.SetStringAsync(
                $"2fa:{tokenHash}",
                json,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });

            return rawToken;
        }

        public async Task<Result<Usuario>> ValidateTwoFactorAsync(string token, string code)
        {
            var tokenHash = TokenHelper.Hash(token);

            var json = await _cache.GetStringAsync($"2fa:{tokenHash}");

            if (json is null)
                return Result<Usuario>.Fail("Sessão 2FA expirada ou inválida.");

            var session = JsonSerializer.Deserialize<TwoFactorSession>(json);

            if (session is null)
                return Result<Usuario>.Fail("Sessão 2FA inválida.");

            var user = await _userRepository.GetByIdAsync(session.UserId);

            if (user is null)
                return Result<Usuario>.Fail("Usuário não encontrado.");

            var validCode = _2FAHelper.ValidateAuthenticatorCode(user.TwoFactorSecret, code);

            if (!validCode)
                return Result<Usuario>.Fail("Código inválido.");

            await _cache.RemoveAsync($"2fa:{tokenHash}");

            return Result<Usuario>.Ok(user);
        }

        public Result<Usuario> CreateUser(CreateAccountArgs args)
        {
            if (args is null)
                return Result<Usuario>.Fail("Argumentos inválidos!");

            if (string.IsNullOrWhiteSpace(args.Name) || string.IsNullOrWhiteSpace(args.Email) || string.IsNullOrWhiteSpace(args.Password))
                return Result<Usuario>.Fail("Credenciais inválidas!");

            var user = new Usuario()
            {
                Name = args.Name,
                Email = args.Email,
                Password = _passwordService.Hash(args.Password),
                Ativo = true
            };

            _userRepository.Create(user);

            _uow.Commit();

            return Result<Usuario>.Ok(user);   
        }

        public async Task<Result<EnableTwoFactorResult>> EnableTwoFactorAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user is null)
                return Result<EnableTwoFactorResult>.Fail("Usuário não encontrado.");

            var secretBytes = RandomNumberGenerator.GetBytes(20);
            var secret = Base32Encoding.ToString(secretBytes);

            user.TwoFactorSecret = secret;
            user.TwoFactorEnabled = false; // ainda não confirmou

            _userRepository.Update(user);
            _uow.Commit();

            var issuer = "budgets";

            var otpAuthUrl =
                $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(user.Email)}" +
                $"?secret={Uri.EscapeDataString(secret)}" +
                $"&issuer={Uri.EscapeDataString(issuer)}" +
                $"&digits=6";

            return Result<EnableTwoFactorResult>.Ok(new EnableTwoFactorResult(secret, otpAuthUrl));
        }

        public async Task<Result> ConfirmTwoFactorAsync(Guid userId, string code)
        {
            if (userId == Guid.Empty)
                return Result.Fail("Usuário inválido.");

            var user = await _userRepository.GetByIdAsync(userId);

            if (user is null)
                return Result.Fail("Usuário não encontrado.");

            if (string.IsNullOrWhiteSpace(user.TwoFactorSecret))
                return Result.Fail("Configuração de 2FA não iniciada.");

            if (user.TwoFactorEnabled)
                return Result.Fail("2FA já está ativo para este usuário.");

            var validCode = _2FAHelper.ValidateAuthenticatorCode(user.TwoFactorSecret, code);

            if (!validCode)
                return Result.Fail("Código inválido.");

            user.TwoFactorEnabled = true;
            user.TwoFactorEnabledAt = DateTimeOffset.UtcNow;

            _userRepository.Update(user);
            _uow.Commit();

            return Result.Ok();
        }

        public async Task<Result> DisableTwoFactorAsync(Guid userId, string code)
        {
            if (userId == Guid.Empty)
                return Result.Fail("Usuário inválido.");

            var user = await _userRepository.GetByIdAsync(userId);

            if (user is null)
                return Result.Fail("Usuário não encontrado.");

            if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.TwoFactorSecret))
                return Result.Fail("2FA não está ativo para este usuário.");

            var validCode = _2FAHelper.ValidateAuthenticatorCode(user.TwoFactorSecret, code);

            if (!validCode)
                return Result.Fail("Código inválido.");

            user.TwoFactorEnabled = false;
            user.TwoFactorSecret = string.Empty;
            user.TwoFactorEnabledAt = default;

            _userRepository.Update(user);
            _uow.Commit();

            return Result.Ok();
        }

        public Result SaveUserRefreshToken(Guid userId, string refreshTokenHash)
        {
            if (userId == Guid.Empty)
                return Result.Fail("Usuário não encontrado.");

            _usuarioRefreshTokenRepository.Create(new UsuarioRefreshToken()
            {
                UserId = userId,
                TokenHash = refreshTokenHash,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
            });

            _uow.Commit();

            return Result.Ok();
        }

        public async Task<Result<Usuario>> GetUserByRefreshTokenAsync(string refreshToken)
        {
            var savedToken = _usuarioRefreshTokenRepository.GetByToken(refreshToken);

            if (savedToken == null || !savedToken.IsActive)
                return Result<Usuario>.Fail("Token inválido ou expirado.");

            if (savedToken.UserId == Guid.Empty)
                return Result<Usuario>.Fail("Usuário inválido.");

            var user = await _userRepository.GetByIdAsync(savedToken.UserId);

            if (user is null)
                return Result<Usuario>.Fail("Usuário não encontrado.");

            if(!user.Ativo)
                return Result<Usuario>.Fail("Usuário inativo.");

            return Result<Usuario>.Ok(user); 
        }

        public Result InvalidateRefreshToken(string refreshToken)
        {
            var savedToken = _usuarioRefreshTokenRepository.GetByToken(refreshToken);

            if (savedToken == null || !savedToken.IsActive)
                return Result.Ok();

            savedToken.RevokedAt = DateTimeOffset.UtcNow;

            _usuarioRefreshTokenRepository.Update(savedToken);
            _uow.Commit();

            return Result.Ok();
        }
    }
}
