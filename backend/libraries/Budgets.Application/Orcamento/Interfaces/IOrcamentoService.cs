using Budgets.Application.Orcamento.Models;
using Budgets.Shared.Results;
using OrcamentoEntity = Budgets.Domain.Orcamento.Entities.Orcamento;

namespace Budgets.Application.Orcamento.Interfaces
{
    public interface IOrcamentoService
    {
        Task<Result<OrcamentoEntity>> CreateAsync(CreateOrcamentoArgs args);
        Task<Result<IEnumerable<OrcamentoEntity>>> GetAllAsync();
        Task<Result<OrcamentoEntity>> GetByIdAsync(Guid id);
        Task<Result<GeneratedOrcamentoFileResult>> GenerateFileAsync(Guid id, OrcamentoFileType fileType, CancellationToken cancellationToken = default);
        Task<Result<QueueOrcamentoEmailResult>> QueueEmailAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<OrcamentoEntity>> UpdateAsync(Guid id, UpdateOrcamentoArgs args);
        Task<Result> DeleteAsync(Guid id);
    }
}
