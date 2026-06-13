using Budgets.Application.Estabelecimento.Interfaces;
using Budgets.Application.Estabelecimento.Models;
using Budgets.Domain.Estabelecimento.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using EstabelecimentoEntity = Budgets.Domain.Estabelecimento.Entities.Estabelecimento;

namespace Budgets.Application.Estabelecimento.Services
{
    public class EstabelecimentoService : IEstabelecimentoService
    {
        private readonly IEstabelecimentoRepository _estabelecimentoRepository;
        private readonly IUnitOfWork _uow;

        public EstabelecimentoService(IUnitOfWork uow, IEstabelecimentoRepository estabelecimentoRepository)
        {
            _uow = uow;
            _estabelecimentoRepository = estabelecimentoRepository;
        }

        public async Task<Result<EstabelecimentoEntity>> CreateAsync(CreateEstabelecimentoArgs args)
        {
            if (args is null)
                return Result<EstabelecimentoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.RazaoSocial))
                return Result<EstabelecimentoEntity>.Fail("Razão social é obrigatória.");

            var estabelecimento = new EstabelecimentoEntity
            {
                RazaoSocial = args.RazaoSocial.Trim(),
                NomeFantasia = args.NomeFantasia?.Trim(),
                Cnpj = args.Cnpj?.Trim(),
                InscricaoEstadual = args.InscricaoEstadual?.Trim(),
                Email = args.Email?.Trim(),
                Telefone = args.Telefone?.Trim(),
                WhatsApp = args.WhatsApp?.Trim(),
                Cep = args.Cep?.Trim(),
                Logradouro = args.Logradouro?.Trim(),
                Numero = args.Numero?.Trim(),
                Complemento = args.Complemento?.Trim(),
                Bairro = args.Bairro?.Trim(),
                Cidade = args.Cidade?.Trim(),
                Uf = args.Uf?.Trim(),
                LogoUrl = args.LogoUrl?.Trim(),
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _estabelecimentoRepository.Create(estabelecimento);
            await _uow.CommitAsync();

            return Result<EstabelecimentoEntity>.Ok(estabelecimento);
        }

        public async Task<Result<IEnumerable<EstabelecimentoEntity>>> GetAllAsync()
        {
            var estabelecimentos = await _estabelecimentoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<EstabelecimentoEntity>>.Ok(estabelecimentos);
        }

        public async Task<Result<EstabelecimentoEntity>> GetByIdAsync(Guid id)
        {
            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (estabelecimento is null)
                return Result<EstabelecimentoEntity>.Fail("Estabelecimento não encontrado.");

            return Result<EstabelecimentoEntity>.Ok(estabelecimento);
        }

        public async Task<Result<EstabelecimentoEntity>> UpdateAsync(Guid id, UpdateEstabelecimentoArgs args)
        {
            if (args is null)
                return Result<EstabelecimentoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.RazaoSocial))
                return Result<EstabelecimentoEntity>.Fail("Razão social é obrigatória.");

            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (estabelecimento is null)
                return Result<EstabelecimentoEntity>.Fail("Estabelecimento não encontrado.");

            estabelecimento.RazaoSocial = args.RazaoSocial.Trim();
            estabelecimento.NomeFantasia = args.NomeFantasia?.Trim();
            estabelecimento.Cnpj = args.Cnpj?.Trim();
            estabelecimento.InscricaoEstadual = args.InscricaoEstadual?.Trim();
            estabelecimento.Email = args.Email?.Trim();
            estabelecimento.Telefone = args.Telefone?.Trim();
            estabelecimento.WhatsApp = args.WhatsApp?.Trim();
            estabelecimento.Cep = args.Cep?.Trim();
            estabelecimento.Logradouro = args.Logradouro?.Trim();
            estabelecimento.Numero = args.Numero?.Trim();
            estabelecimento.Complemento = args.Complemento?.Trim();
            estabelecimento.Bairro = args.Bairro?.Trim();
            estabelecimento.Cidade = args.Cidade?.Trim();
            estabelecimento.Uf = args.Uf?.Trim();
            estabelecimento.LogoUrl = args.LogoUrl?.Trim();
            estabelecimento.AtualizadoEm = DateTime.UtcNow;

            _estabelecimentoRepository.Update(estabelecimento);
            await _uow.CommitAsync();

            return Result<EstabelecimentoEntity>.Ok(estabelecimento);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (estabelecimento is null)
                return Result.Fail("Estabelecimento não encontrado.");

            estabelecimento.Ativo = false;
            estabelecimento.AtualizadoEm = DateTime.UtcNow;

            _estabelecimentoRepository.Update(estabelecimento);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
