using Budgets.Application.Template.Models;
using Budgets.Shared.Results;
using TemplateOrcamentoMacroEntity = Budgets.Domain.Template.Entities.TemplateOrcamentoMacro;
using TemplateOrcamentoEntity = Budgets.Domain.Template.Entities.TemplateOrcamento;

namespace Budgets.Application.Template.Interfaces
{
    public interface ITemplateOrcamentoService
    {
        Task<Result<TemplateOrcamentoEntity>> CreateAsync(CreateTemplateOrcamentoArgs args);
        Task<Result<IEnumerable<TemplateOrcamentoEntity>>> GetAllAsync();
        Task<Result<TemplateOrcamentoEntity>> GetByIdAsync(Guid id);
        Task<Result<TemplateOrcamentoEntity>> UpdateAsync(Guid id, UpdateTemplateOrcamentoArgs args);
        Task<Result> DeleteAsync(Guid id);
        Task<Result<IEnumerable<TemplateOrcamentoMacroEntity>>> GetAllMacrosAsync();
        Task<Result<TemplateOrcamentoMacroEntity>> GetMacroByIdAsync(Guid id);
    }
}
