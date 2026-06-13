using Budgets.Application.FormaPagamento.Interfaces;
using Budgets.Application.FormaPagamento.Models;
using Budgets.Domain.FormaPagamento.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using FormaPagamentoEntity = Budgets.Domain.FormaPagamento.Entities.FormaPagamento;

namespace Budgets.Application.FormaPagamento.Services
{
    public class FormaPagamentoService : IFormaPagamentoService
    {
        private readonly IFormaPagamentoRepository _formaPagamentoRepository;
        private readonly IUnitOfWork _uow;

        public FormaPagamentoService(IUnitOfWork uow, IFormaPagamentoRepository formaPagamentoRepository)
        {
            _uow = uow;
            _formaPagamentoRepository = formaPagamentoRepository;
        }

        public async Task<Result<FormaPagamentoEntity>> CreateAsync(CreateFormaPagamentoArgs args)
        {
            if (args is null)
                return Result<FormaPagamentoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<FormaPagamentoEntity>.Fail("Nome é obrigatório.");

            if (string.IsNullOrWhiteSpace(args.Tipo))
                return Result<FormaPagamentoEntity>.Fail("Tipo é obrigatório.");

            var formaPagamento = new FormaPagamentoEntity
            {
                Nome = args.Nome.Trim(),
                Tipo = args.Tipo.Trim(),
                Ativo = true
            };

            _formaPagamentoRepository.Create(formaPagamento);
            await _uow.CommitAsync();

            return Result<FormaPagamentoEntity>.Ok(formaPagamento);
        }

        public async Task<Result<IEnumerable<FormaPagamentoEntity>>> GetAllAsync()
        {
            var formasPagamento = await _formaPagamentoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<FormaPagamentoEntity>>.Ok(formasPagamento);
        }

        public async Task<Result<FormaPagamentoEntity>> GetByIdAsync(Guid id)
        {
            var formaPagamento = await _formaPagamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (formaPagamento is null)
                return Result<FormaPagamentoEntity>.Fail("Forma de pagamento não encontrada.");

            return Result<FormaPagamentoEntity>.Ok(formaPagamento);
        }

        public async Task<Result<FormaPagamentoEntity>> UpdateAsync(Guid id, UpdateFormaPagamentoArgs args)
        {
            if (args is null)
                return Result<FormaPagamentoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<FormaPagamentoEntity>.Fail("Nome é obrigatório.");

            if (string.IsNullOrWhiteSpace(args.Tipo))
                return Result<FormaPagamentoEntity>.Fail("Tipo é obrigatório.");

            var formaPagamento = await _formaPagamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (formaPagamento is null)
                return Result<FormaPagamentoEntity>.Fail("Forma de pagamento não encontrada.");

            formaPagamento.Nome = args.Nome.Trim();
            formaPagamento.Tipo = args.Tipo.Trim();

            _formaPagamentoRepository.Update(formaPagamento);
            await _uow.CommitAsync();

            return Result<FormaPagamentoEntity>.Ok(formaPagamento);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var formaPagamento = await _formaPagamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (formaPagamento is null)
                return Result.Fail("Forma de pagamento não encontrada.");

            formaPagamento.Ativo = false;

            _formaPagamentoRepository.Update(formaPagamento);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
