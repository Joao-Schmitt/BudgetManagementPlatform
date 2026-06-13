using Budgets.Api.Contracts;
using Budgets.Application.FormaPagamento.Interfaces;
using Budgets.Application.FormaPagamento.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FormaPagamentoController : ControllerBase
    {
        private readonly IFormaPagamentoService _formaPagamentoService;

        public FormaPagamentoController(IFormaPagamentoService formaPagamentoService)
        {
            _formaPagamentoService = formaPagamentoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateFormaPagamentoRequest request)
        {
            var result = await _formaPagamentoService.CreateAsync(new CreateFormaPagamentoArgs(
                request.Nome,
                request.Tipo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _formaPagamentoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _formaPagamentoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateFormaPagamentoRequest request)
        {
            var result = await _formaPagamentoService.UpdateAsync(id, new UpdateFormaPagamentoArgs(
                request.Nome,
                request.Tipo));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _formaPagamentoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
