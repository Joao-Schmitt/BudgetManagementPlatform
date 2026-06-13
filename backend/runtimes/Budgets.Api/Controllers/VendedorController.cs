using Budgets.Api.Contracts;
using Budgets.Application.Vendedor.Interfaces;
using Budgets.Application.Vendedor.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class VendedorController : ControllerBase
    {
        private readonly IVendedorService _vendedorService;

        public VendedorController(IVendedorService vendedorService)
        {
            _vendedorService = vendedorService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateVendedorRequest request)
        {
            var result = await _vendedorService.CreateAsync(new CreateVendedorArgs(
                request.EstabelecimentoId,
                request.UsuarioId,
                request.Nome,
                request.Email,
                request.Telefone,
                request.PercentualComissaoPadrao));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _vendedorService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _vendedorService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateVendedorRequest request)
        {
            var result = await _vendedorService.UpdateAsync(id, new UpdateVendedorArgs(
                request.EstabelecimentoId,
                request.UsuarioId,
                request.Nome,
                request.Email,
                request.Telefone,
                request.PercentualComissaoPadrao));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _vendedorService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
