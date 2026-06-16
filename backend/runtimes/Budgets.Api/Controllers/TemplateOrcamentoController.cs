using Budgets.Api.Contracts;
using Budgets.Application.Template.Interfaces;
using Budgets.Application.Template.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TemplateOrcamentoController : ControllerBase
    {
        private readonly ITemplateOrcamentoService _templateOrcamentoService;

        public TemplateOrcamentoController(ITemplateOrcamentoService templateOrcamentoService)
        {
            _templateOrcamentoService = templateOrcamentoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTemplateOrcamentoRequest request)
        {
            var result = await _templateOrcamentoService.CreateAsync(new CreateTemplateOrcamentoArgs(
                request.Titulo,
                request.Descricao,
                request.Html));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _templateOrcamentoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMacros()
        {
            var result = await _templateOrcamentoService.GetAllMacrosAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetMacroById(Guid id)
        {
            var result = await _templateOrcamentoService.GetMacroByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _templateOrcamentoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateTemplateOrcamentoRequest request)
        {
            var result = await _templateOrcamentoService.UpdateAsync(id, new UpdateTemplateOrcamentoArgs(
                request.Titulo,
                request.Descricao,
                request.Html));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _templateOrcamentoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
