using Budgets.Application.Produto.Interfaces;
using Budgets.Application.Produto.Models;
using Budgets.Domain.Produto.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using ProdutoEntity = Budgets.Domain.Produto.Entities.Produto;

namespace Budgets.Application.Produto.Services
{
    public class ProdutoService : IProdutoService
    {
        private readonly IProdutoRepository _produtoRepository;
        private readonly IUnitOfWork _uow;

        public ProdutoService(IUnitOfWork uow, IProdutoRepository produtoRepository)
        {
            _uow = uow;
            _produtoRepository = produtoRepository;
        }

        public async Task<Result<ProdutoEntity>> CreateAsync(CreateProdutoArgs args)
        {
            if (args is null)
                return Result<ProdutoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ProdutoEntity>.Fail("Nome é obrigatório.");

            if (args.ValorVenda < 0)
                return Result<ProdutoEntity>.Fail("Valor de venda inválido.");

            if (args.Custo.HasValue && args.Custo.Value < 0)
                return Result<ProdutoEntity>.Fail("Custo inválido.");

            var produto = new ProdutoEntity
            {
                Codigo = args.Codigo?.Trim(),
                Nome = args.Nome.Trim(),
                Descricao = args.Descricao?.Trim(),
                Unidade = string.IsNullOrWhiteSpace(args.Unidade) ? "UN" : args.Unidade.Trim(),
                ValorVenda = args.ValorVenda,
                Custo = args.Custo,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _produtoRepository.Create(produto);
            await _uow.CommitAsync();

            return Result<ProdutoEntity>.Ok(produto);
        }

        public async Task<Result<IEnumerable<ProdutoEntity>>> GetAllAsync()
        {
            var produtos = await _produtoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<ProdutoEntity>>.Ok(produtos);
        }

        public async Task<Result<ProdutoEntity>> GetByIdAsync(Guid id)
        {
            var produto = await _produtoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (produto is null)
                return Result<ProdutoEntity>.Fail("Produto não encontrado.");

            return Result<ProdutoEntity>.Ok(produto);
        }

        public async Task<Result<ProdutoEntity>> UpdateAsync(Guid id, UpdateProdutoArgs args)
        {
            if (args is null)
                return Result<ProdutoEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ProdutoEntity>.Fail("Nome é obrigatório.");

            if (args.ValorVenda < 0)
                return Result<ProdutoEntity>.Fail("Valor de venda inválido.");

            if (args.Custo.HasValue && args.Custo.Value < 0)
                return Result<ProdutoEntity>.Fail("Custo inválido.");

            var produto = await _produtoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (produto is null)
                return Result<ProdutoEntity>.Fail("Produto não encontrado.");

            produto.Codigo = args.Codigo?.Trim();
            produto.Nome = args.Nome.Trim();
            produto.Descricao = args.Descricao?.Trim();
            produto.Unidade = string.IsNullOrWhiteSpace(args.Unidade) ? "UN" : args.Unidade.Trim();
            produto.ValorVenda = args.ValorVenda;
            produto.Custo = args.Custo;

            _produtoRepository.Update(produto);
            await _uow.CommitAsync();

            return Result<ProdutoEntity>.Ok(produto);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var produto = await _produtoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (produto is null)
                return Result.Fail("Produto não encontrado.");

            produto.Ativo = false;

            _produtoRepository.Update(produto);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
