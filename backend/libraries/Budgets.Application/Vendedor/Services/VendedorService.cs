using Budgets.Application.Vendedor.Interfaces;
using Budgets.Application.Vendedor.Models;
using Budgets.Domain.Estabelecimento.Interfaces;
using Budgets.Domain.Vendedor.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using VendedorEntity = Budgets.Domain.Vendedor.Entities.Vendedor;

namespace Budgets.Application.Vendedor.Services
{
    public class VendedorService : IVendedorService
    {
        private readonly IEstabelecimentoRepository _estabelecimentoRepository;
        private readonly IVendedorRepository _vendedorRepository;
        private readonly IUnitOfWork _uow;

        public VendedorService(
            IUnitOfWork uow,
            IVendedorRepository vendedorRepository,
            IEstabelecimentoRepository estabelecimentoRepository)
        {
            _uow = uow;
            _vendedorRepository = vendedorRepository;
            _estabelecimentoRepository = estabelecimentoRepository;
        }

        public async Task<Result<VendedorEntity>> CreateAsync(CreateVendedorArgs args)
        {
            if (args is null)
                return Result<VendedorEntity>.Fail("Argumentos inválidos.");

            if (args.EstabelecimentoId == Guid.Empty)
                return Result<VendedorEntity>.Fail("Estabelecimento é obrigatório.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<VendedorEntity>.Fail("Nome é obrigatório.");

            if (args.PercentualComissaoPadrao < 0)
                return Result<VendedorEntity>.Fail("Percentual de comissão inválido.");

            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(
                x => x.Id == args.EstabelecimentoId && x.Ativo,
                readOnly: true);

            if (estabelecimento is null)
                return Result<VendedorEntity>.Fail("Estabelecimento não encontrado.");

            var vendedor = new VendedorEntity
            {
                EstabelecimentoId = args.EstabelecimentoId,
                UsuarioId = args.UsuarioId,
                Nome = args.Nome.Trim(),
                Email = args.Email?.Trim(),
                Telefone = args.Telefone?.Trim(),
                PercentualComissaoPadrao = args.PercentualComissaoPadrao,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _vendedorRepository.Create(vendedor);
            await _uow.CommitAsync();

            return Result<VendedorEntity>.Ok(vendedor);
        }

        public async Task<Result<IEnumerable<VendedorEntity>>> GetAllAsync()
        {
            var vendedores = await _vendedorRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<VendedorEntity>>.Ok(vendedores);
        }

        public async Task<Result<VendedorEntity>> GetByIdAsync(Guid id)
        {
            var vendedor = await _vendedorRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (vendedor is null)
                return Result<VendedorEntity>.Fail("Vendedor não encontrado.");

            return Result<VendedorEntity>.Ok(vendedor);
        }

        public async Task<Result<VendedorEntity>> UpdateAsync(Guid id, UpdateVendedorArgs args)
        {
            if (args is null)
                return Result<VendedorEntity>.Fail("Argumentos inválidos.");

            if (args.EstabelecimentoId == Guid.Empty)
                return Result<VendedorEntity>.Fail("Estabelecimento é obrigatório.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<VendedorEntity>.Fail("Nome é obrigatório.");

            if (args.PercentualComissaoPadrao < 0)
                return Result<VendedorEntity>.Fail("Percentual de comissão inválido.");

            var vendedor = await _vendedorRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (vendedor is null)
                return Result<VendedorEntity>.Fail("Vendedor não encontrado.");

            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(
                x => x.Id == args.EstabelecimentoId && x.Ativo,
                readOnly: true);

            if (estabelecimento is null)
                return Result<VendedorEntity>.Fail("Estabelecimento não encontrado.");

            vendedor.EstabelecimentoId = args.EstabelecimentoId;
            vendedor.UsuarioId = args.UsuarioId;
            vendedor.Nome = args.Nome.Trim();
            vendedor.Email = args.Email?.Trim();
            vendedor.Telefone = args.Telefone?.Trim();
            vendedor.PercentualComissaoPadrao = args.PercentualComissaoPadrao;

            _vendedorRepository.Update(vendedor);
            await _uow.CommitAsync();

            return Result<VendedorEntity>.Ok(vendedor);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var vendedor = await _vendedorRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (vendedor is null)
                return Result.Fail("Vendedor não encontrado.");

            vendedor.Ativo = false;

            _vendedorRepository.Update(vendedor);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
