namespace Budgets.Application.Orcamento.Models
{
    public sealed class QueueOrcamentoEmailResult
    {
        public Guid FilaEmailId { get; init; }
        public string Destinatario { get; init; } = string.Empty;
        public string FileName { get; init; } = string.Empty;
    }
}
