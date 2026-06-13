using Budgets.Application.Cliente.Interfaces;
using Budgets.Application.Cliente.Models;
using Budgets.Domain.Cliente.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using ClienteEntity = Budgets.Domain.Cliente.Entities.Cliente;

namespace Budgets.Application.Cliente.Services
{
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;
        private readonly IUnitOfWork _uow;

        public ClienteService(IUnitOfWork uow, IClienteRepository clienteRepository)
        {
            _uow = uow;
            _clienteRepository = clienteRepository;
        }

        public async Task<Result<ClienteEntity>> CreateAsync(CreateClienteArgs args)
        {
            if (args is null)
                return Result<ClienteEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ClienteEntity>.Fail("Nome é obrigatório.");

            var cliente = new ClienteEntity
            {
                Nome = args.Nome.Trim(),
                Documento = args.Documento?.Trim(),
                Email = args.Email?.Trim(),
                Telefone = args.Telefone?.Trim(),
                WhatsApp = args.WhatsApp?.Trim(),
                Cep = args.Cep?.Trim(),
                Logradouro = args.Logradouro?.Trim(),
                Numero = args.Numero?.Trim(),
                Complemento = args.Complemento?.Trim(),
                Bairro = args.Bairro?.Trim(),
                Cidade = args.Cidade?.Trim(),
                Uf = args.Uf?.Trim(),
                Observacao = args.Observacao?.Trim(),
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _clienteRepository.Create(cliente);
            await _uow.CommitAsync();

            return Result<ClienteEntity>.Ok(cliente);
        }

        public async Task<Result<IEnumerable<ClienteEntity>>> GetAllAsync()
        {
            var clientes = await _clienteRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<ClienteEntity>>.Ok(clientes);
        }

        public async Task<Result<ClienteEntity>> GetByIdAsync(Guid id)
        {
            var cliente = await _clienteRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (cliente is null)
                return Result<ClienteEntity>.Fail("Cliente não encontrado.");

            return Result<ClienteEntity>.Ok(cliente);
        }

        public async Task<Result<ClienteEntity>> UpdateAsync(Guid id, UpdateClienteArgs args)
        {
            if (args is null)
                return Result<ClienteEntity>.Fail("Argumentos inválidos.");

            if (string.IsNullOrWhiteSpace(args.Nome))
                return Result<ClienteEntity>.Fail("Nome é obrigatório.");

            var cliente = await _clienteRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (cliente is null)
                return Result<ClienteEntity>.Fail("Cliente não encontrado.");

            cliente.Nome = args.Nome.Trim();
            cliente.Documento = args.Documento?.Trim();
            cliente.Email = args.Email?.Trim();
            cliente.Telefone = args.Telefone?.Trim();
            cliente.WhatsApp = args.WhatsApp?.Trim();
            cliente.Cep = args.Cep?.Trim();
            cliente.Logradouro = args.Logradouro?.Trim();
            cliente.Numero = args.Numero?.Trim();
            cliente.Complemento = args.Complemento?.Trim();
            cliente.Bairro = args.Bairro?.Trim();
            cliente.Cidade = args.Cidade?.Trim();
            cliente.Uf = args.Uf?.Trim();
            cliente.Observacao = args.Observacao?.Trim();

            _clienteRepository.Update(cliente);
            await _uow.CommitAsync();

            return Result<ClienteEntity>.Ok(cliente);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var cliente = await _clienteRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (cliente is null)
                return Result.Fail("Cliente não encontrado.");

            cliente.Ativo = false;

            _clienteRepository.Update(cliente);
            await _uow.CommitAsync();

            return Result.Ok();
        }
    }
}
