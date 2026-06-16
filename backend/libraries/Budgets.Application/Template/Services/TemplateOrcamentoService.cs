using Budgets.Application.Template.Interfaces;
using Budgets.Application.Template.Models;
using Budgets.Domain.Template.Entities;
using Budgets.Domain.Template.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using TemplateOrcamentoMacroEntity = Budgets.Domain.Template.Entities.TemplateOrcamentoMacro;
using TemplateOrcamentoEntity = Budgets.Domain.Template.Entities.TemplateOrcamento;

namespace Budgets.Application.Template.Services
{
    public class TemplateOrcamentoService : ITemplateOrcamentoService
    {
        private readonly ITemplateOrcamentoRepository _templateOrcamentoRepository;
        private readonly ITemplateOrcamentoMacroRepository _templateOrcamentoMacroRepository;
        private readonly IUnitOfWork _uow;

        public TemplateOrcamentoService(
            IUnitOfWork uow,
            ITemplateOrcamentoRepository templateOrcamentoRepository,
            ITemplateOrcamentoMacroRepository templateOrcamentoMacroRepository)
        {
            _uow = uow;
            _templateOrcamentoRepository = templateOrcamentoRepository;
            _templateOrcamentoMacroRepository = templateOrcamentoMacroRepository;
        }

        public async Task<Result<TemplateOrcamentoEntity>> CreateAsync(CreateTemplateOrcamentoArgs args)
        {
            if (args is null)
                return Result<TemplateOrcamentoEntity>.Fail("Argumentos invalidos.");

            if (string.IsNullOrWhiteSpace(args.Titulo))
                return Result<TemplateOrcamentoEntity>.Fail("Titulo e obrigatorio.");

            if (string.IsNullOrWhiteSpace(args.Html))
                return Result<TemplateOrcamentoEntity>.Fail("HTML e obrigatorio.");

            var templateOrcamento = new TemplateOrcamentoEntity
            {
                Titulo = args.Titulo.Trim(),
                Descricao = args.Descricao?.Trim() ?? string.Empty,
                Html = args.Html,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _templateOrcamentoRepository.Create(templateOrcamento);
            await _uow.CommitAsync();

            return Result<TemplateOrcamentoEntity>.Ok(templateOrcamento);
        }

        public async Task<Result<IEnumerable<TemplateOrcamentoEntity>>> GetAllAsync()
        {
            var templatesOrcamento = await _templateOrcamentoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<TemplateOrcamentoEntity>>.Ok(templatesOrcamento);
        }

        public async Task<Result<TemplateOrcamentoEntity>> GetByIdAsync(Guid id)
        {
            var templateOrcamento = await _templateOrcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (templateOrcamento is null)
                return Result<TemplateOrcamentoEntity>.Fail("Template de orcamento nao encontrado.");

            return Result<TemplateOrcamentoEntity>.Ok(templateOrcamento);
        }

        public async Task<Result<TemplateOrcamentoEntity>> UpdateAsync(Guid id, UpdateTemplateOrcamentoArgs args)
        {
            if (args is null)
                return Result<TemplateOrcamentoEntity>.Fail("Argumentos invalidos.");

            if (string.IsNullOrWhiteSpace(args.Titulo))
                return Result<TemplateOrcamentoEntity>.Fail("Titulo e obrigatorio.");

            if (string.IsNullOrWhiteSpace(args.Html))
                return Result<TemplateOrcamentoEntity>.Fail("HTML e obrigatorio.");

            var templateOrcamento = await _templateOrcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (templateOrcamento is null)
                return Result<TemplateOrcamentoEntity>.Fail("Template de orcamento nao encontrado.");

            templateOrcamento.Titulo = args.Titulo.Trim();
            templateOrcamento.Descricao = args.Descricao?.Trim() ?? string.Empty;
            templateOrcamento.Html = args.Html;

            _templateOrcamentoRepository.Update(templateOrcamento);
            await _uow.CommitAsync();

            return Result<TemplateOrcamentoEntity>.Ok(templateOrcamento);
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var templateOrcamento = await _templateOrcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (templateOrcamento is null)
                return Result.Fail("Template de orcamento nao encontrado.");

            templateOrcamento.Ativo = false;

            _templateOrcamentoRepository.Update(templateOrcamento);
            await _uow.CommitAsync();

            return Result.Ok();
        }

        public async Task<Result<IEnumerable<TemplateOrcamentoMacroEntity>>> GetAllMacrosAsync()
        {
            var macros = await _templateOrcamentoMacroRepository.GetAllAsync(x => true, readOnly: true);
            return Result<IEnumerable<TemplateOrcamentoMacroEntity>>.Ok(macros);
        }

        public async Task<Result<TemplateOrcamentoMacroEntity>> GetMacroByIdAsync(Guid id)
        {
            var macro = await _templateOrcamentoMacroRepository.FirstOrDefaultAsync(x => x.Id == id, readOnly: true);

            if (macro is null)
                return Result<TemplateOrcamentoMacroEntity>.Fail("Macro do template nao encontrada.");

            return Result<TemplateOrcamentoMacroEntity>.Ok(macro);
        }
    }
}
