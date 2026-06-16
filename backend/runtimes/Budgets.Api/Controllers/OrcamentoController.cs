using Budgets.Api.Contracts;
using Budgets.Application.Orcamento.Interfaces;
using Budgets.Application.Orcamento.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class OrcamentoController : ControllerBase
    {
        private readonly IOrcamentoService _orcamentoService;

        public OrcamentoController(IOrcamentoService orcamentoService)
        {
            _orcamentoService = orcamentoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateOrcamentoRequest request)
        {
            var result = await _orcamentoService.CreateAsync(new CreateOrcamentoArgs(
                request.EstabelecimentoId,
                request.ClienteId,
                request.VendedorId,
                request.UsuarioId,
                request.TemplateOrcamentoId,
                request.Observacoes,
                request.FormaPagamentoIds,
                request.Itens.Select(ToItemArgs).ToList()));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _orcamentoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _orcamentoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateOrcamentoRequest request)
        {
            var result = await _orcamentoService.UpdateAsync(id, new UpdateOrcamentoArgs(
                request.EstabelecimentoId,
                request.ClienteId,
                request.VendedorId,
                request.UsuarioId,
                request.TemplateOrcamentoId,
                request.Observacoes,
                request.FormaPagamentoIds,
                request.Itens.Select(ToItemArgs).ToList()));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _orcamentoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }

        [HttpGet("{id:guid}/{fileType}")]
        public async Task<IActionResult> GenerateFile(Guid id, OrcamentoFileType fileType, CancellationToken cancellationToken)
        {
            var result = await _orcamentoService.GenerateFileAsync(id, fileType, cancellationToken);

            if (!result.Success)
                return BadRequest(result.Error);

            var file = result.Value;
            if (file is null)
                return BadRequest("Nao foi possivel gerar o arquivo do orcamento.");

            return File(file.Content, file.ContentType, file.FileName);
        }

        [HttpPost("{id:guid}")]
        public async Task<IActionResult> SendByEmail(Guid id, CancellationToken cancellationToken)
        {
            var result = await _orcamentoService.QueueEmailAsync(id, cancellationToken);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        private static OrcamentoItemArgs ToItemArgs(OrcamentoItemRequest item)
            => new(item.ProdutoId, item.ServicoId, item.Quantidade, item.ValorUnitario);
    }
}
