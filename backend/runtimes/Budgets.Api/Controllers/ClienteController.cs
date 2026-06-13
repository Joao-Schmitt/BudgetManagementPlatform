using Budgets.Api.Contracts;
using Budgets.Application.Cliente.Interfaces;
using Budgets.Application.Cliente.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateClienteRequest request)
        {
            var result = await _clienteService.CreateAsync(new CreateClienteArgs(
                request.Nome,
                request.Documento,
                request.Email,
                request.Telefone,
                request.WhatsApp,
                request.Cep,
                request.Logradouro,
                request.Numero,
                request.Complemento,
                request.Bairro,
                request.Cidade,
                request.Uf,
                request.Observacao));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _clienteService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _clienteService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateClienteRequest request)
        {
            var result = await _clienteService.UpdateAsync(id, new UpdateClienteArgs(
                request.Nome,
                request.Documento,
                request.Email,
                request.Telefone,
                request.WhatsApp,
                request.Cep,
                request.Logradouro,
                request.Numero,
                request.Complemento,
                request.Bairro,
                request.Cidade,
                request.Uf,
                request.Observacao));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _clienteService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
