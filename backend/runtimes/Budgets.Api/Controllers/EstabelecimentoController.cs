using Budgets.Api.Contracts;
using Budgets.Application.Estabelecimento.Interfaces;
using Budgets.Application.Estabelecimento.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budgets.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class EstabelecimentoController : ControllerBase
    {
        private readonly IEstabelecimentoService _estabelecimentoService;

        public EstabelecimentoController(IEstabelecimentoService estabelecimentoService)
        {
            _estabelecimentoService = estabelecimentoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEstabelecimentoRequest request)
        {
            var result = await _estabelecimentoService.CreateAsync(new CreateEstabelecimentoArgs(
                request.RazaoSocial,
                request.NomeFantasia,
                request.Cnpj,
                request.InscricaoEstadual,
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
                request.LogoUrl));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _estabelecimentoService.GetAllAsync();
            return Ok(result.Value);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _estabelecimentoService.GetByIdAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateEstabelecimentoRequest request)
        {
            var result = await _estabelecimentoService.UpdateAsync(id, new UpdateEstabelecimentoArgs(
                request.RazaoSocial,
                request.NomeFantasia,
                request.Cnpj,
                request.InscricaoEstadual,
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
                request.LogoUrl));

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _estabelecimentoService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok();
        }
    }
}
