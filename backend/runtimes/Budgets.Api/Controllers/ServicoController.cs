using Budgets.Api.Contracts;
using Budgets.Application.Servico.Interfaces;
using Budgets.Application.Servico.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ServicoController : ControllerBase
    {
        private readonly IServicoService _servicoService;

        public ServicoController(IServicoService servicoService)
        {
            _servicoService = servicoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateServicoRequest request)
        {
            var result = await _servicoService.CreateAsync(new CreateServicoArgs(
                request.Codigo,
                request.Nome,
                request.Descricao,
                request.Valor,
                request.Custo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _servicoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _servicoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateServicoRequest request)
        {
            var result = await _servicoService.UpdateAsync(id, new UpdateServicoArgs(
                request.Codigo,
                request.Nome,
                request.Descricao,
                request.Valor,
                request.Custo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _servicoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
