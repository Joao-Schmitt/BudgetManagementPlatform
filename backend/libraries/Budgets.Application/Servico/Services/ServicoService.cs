using Budgets.Application.Servico.Interfaces;
using Budgets.Application.Servico.Models;
using Budgets.Domain.Servico.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using ServicoEntity = Budgets.Domain.Servico.Entities.Servico;

namespace Budgets.Application.Servico.Services
{
    public class ServicoService : IServicoService
    {
        private readonly IServicoRepository _servicoRepository;
        private readonly IUnitOfWork _uow;

        public ServicoService(IUnitOfWork uow, IServicoRepository servicoRepository)
        {
            _uow = uow;
            _servicoRepository = servicoRepository;
        }

        public async Task<Result<ServicoEntity>> CreateAsync(CreateServicoArgs args)
        {
            if (args is null)
                return Result<ServicoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ServicoEntity>.Fail("Nome é obrigatório.");

            if (args.Valor < 0)
                return Result<ServicoEntity>.Fail("Valor inválido.");

            if (args.Custo.HasValue && args.Custo.Value < 0)
                return Result<ServicoEntity>.Fail("Custo inválido.");

            var servico = new ServicoEntity
            {
                Codigo = args.Codigo?.Trim(),
                Nome = args.Nome.Trim(),
                Descricao = args.Descricao?.Trim(),
                Valor = args.Valor,
                Custo = args.Custo,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _servicoRepository.Create(servico);
            await _uow.CommitAsync();

            return Result<ServicoEntity>.Ok(servico);
        }

        public async Task<Result<IEnumerable<ServicoEntity>>> GetAllAsync()
        {
            var servicos = await _servicoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<ServicoEntity>>.Ok(servicos);
        }

        public async Task<Result<ServicoEntity>> GetByIdAsync(Guid id)
        {
            var servico = await _servicoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (servico is null)
                return Result<ServicoEntity>.Fail("Serviço não encontrado.");

            return Result<ServicoEntity>.Ok(servico);
        }

        public async Task<Result<ServicoEntity>> UpdateAsync(Guid id, UpdateServicoArgs args)
        {
            if (args is null)
                return Result<ServicoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ServicoEntity>.Fail("Nome é obrigatório.");

            if (args.Valor < 0)
                return Result<ServicoEntity>.Fail("Valor inválido.");

            if (args.Custo.HasValue && args.Custo.Value < 0)
                return Result<ServicoEntity>.Fail("Custo inválido.");

            var servico = await _servicoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (servico is null)
                return Result<ServicoEntity>.Fail("Serviço não encontrado.");

            servico.Codigo = args.Codigo?.Trim();
            servico.Nome = args.Nome.Trim();
            servico.Descricao = args.Descricao?.Trim();
            servico.Valor = args.Valor;
            servico.Custo = args.Custo;

            _servicoRepository.Update(servico);
            await _uow.CommitAsync();

            return Result<ServicoEntity>.Ok(servico);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var servico = await _servicoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (servico is null)
                return Result.Fail("Serviço não encontrado.");

            servico.Ativo = false;

            _servicoRepository.Update(servico);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
