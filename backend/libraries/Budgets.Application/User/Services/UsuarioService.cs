using Budgets.Application.Security.Interfaces;
using Budgets.Application.User.Interfaces;
using Budgets.Application.User.Models;
using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using Budgets.Shared.Security;

namespace Budgets.Application.User.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordService _passwordService;
        private readonly IUnitOfWork _uow;

        public UsuarioService(
            IUnitOfWork uow,
            IUsuarioRepository usuarioRepository,
            IPasswordService passwordService)
        {
            _uow = uow;
            _usuarioRepository = usuarioRepository;
            _passwordService = passwordService;
        }

        public async Task<Result<Usuario>> UpdateNameAsync(Guid userId, UpdateUserNameArgs args)
        {
            if (userId == Guid.Empty)
                return Result<Usuario>.Fail("Usuário inválido.");

            if (args is null)
                return Result<Usuario>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Name))
                return Result<Usuario>.Fail("Nome é obrigatório.");

            var user = await GetActiveUserAsync(userId);

            if (user is null)
                return Result<Usuario>.Fail("Usuário não encontrado.");

            user.Name = args.Name.Trim();

            _usuarioRepository.Update(user);
            await _uow.CommitAsync();

            return Result<Usuario>.Ok(user);
        }

        public async Task<Result<Usuario>> UpdateEmailAsync(Guid userId, UpdateUserEmailArgs args)
        {
            if (userId == Guid.Empty)
                return Result<Usuario>.Fail("Usuário inválido.");

            if (args is null)
                return Result<Usuario>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Email))
                return Result<Usuario>.Fail("E-mail é obrigatório.");

            var user = await GetActiveUserAsync(userId);

            if (user is null)
                return Result<Usuario>.Fail("Usuário não encontrado.");

            var twoFactorResult = ValidateTwoFactorIfRequired(user, args.TwoFactorCode);

            if (!twoFactorResult.Success)
                return Result<Usuario>.Fail(twoFactorResult.Error!);

            var email = args.Email.Trim();
            var existingUser = await _usuarioRepository.GetByEmailAsync(email);

            if (existingUser is not null && existingUser.Id != user.Id)
                return Result<Usuario>.Fail("E-mail já está em uso.");

            user.Email = email;

            _usuarioRepository.Update(user);
            await _uow.CommitAsync();

            return Result<Usuario>.Ok(user);
        }

        public async Task<Result> UpdatePasswordAsync(Guid userId, UpdateUserPasswordArgs args)
        {
            if (userId == Guid.Empty)
                return Result.Fail("Usuário inválido.");

            if (args is null)
                return Result.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.CurrentPassword))
                return Result.Fail("Senha atual é obrigatória.");

            if (string.IsNullOrWhiteSpace(args.NewPassword))
                return Result.Fail("Nova senha é obrigatória.");

            var user = await GetActiveUserAsync(userId);

            if (user is null)
                return Result.Fail("Usuário não encontrado.");

            var twoFactorResult = ValidateTwoFactorIfRequired(user, args.TwoFactorCode);

            if (!twoFactorResult.Success)
                return twoFactorResult;

            if (!_passwordService.Verify(args.CurrentPassword, user.Password))
                return Result.Fail("Senha atual inválida.");

            user.Password = _passwordService.Hash(args.NewPassword);

            _usuarioRepository.Update(user);
            await _uow.CommitAsync();

            return Result.Ok();
        }

        private async Task<Usuario?> GetActiveUserAsync(Guid userId)
        {
            return await _usuarioRepository.FirstOrDefaultAsync(x => x.Id == userId && x.Ativo);
        }

        private static Result ValidateTwoFactorIfRequired(Usuario user, string? code)
        {
            if (!user.TwoFactorEnabled)
                return Result.Ok();

            if (string.IsNullOrWhiteSpace(code))
                return Result.Fail("Código de autenticação de 2 fatores é obrigatório.");

            var validCode = _2FAHelper.ValidateAuthenticatorCode(user.TwoFactorSecret, code);

            if (!validCode)
                return Result.Fail("Código de autenticação de 2 fatores inválido.");

            return Result.Ok();
        }
    }
}
