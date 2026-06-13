using Budgets.Api.Contracts;
using Budgets.Application.Produto.Interfaces;
using Budgets.Application.Produto.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ProdutoController : ControllerBase
    {
        private readonly IProdutoService _produtoService;

        public ProdutoController(IProdutoService produtoService)
        {
            _produtoService = produtoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProdutoRequest request)
        {
            var result = await _produtoService.CreateAsync(new CreateProdutoArgs(
                request.Codigo,
                request.Nome,
                request.Descricao,
                request.Unidade,
                request.ValorVenda,
                request.Custo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _produtoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _produtoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateProdutoRequest request)
        {
            var result = await _produtoService.UpdateAsync(id, new UpdateProdutoArgs(
                request.Codigo,
                request.Nome,
                request.Descricao,
                request.Unidade,
                request.ValorVenda,
                request.Custo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _produtoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
