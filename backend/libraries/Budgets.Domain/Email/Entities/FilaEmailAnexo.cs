using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Email.Entities
{
    public class FilaEmailAnexo : Entity
    {
        public Guid FilaEmailId { get; set; }
        public string NomeArquivo { get; set; } = string.Empty;
        public string TipoConteudo { get; set; } = string.Empty;
        public byte[] Conteudo { get; set; } = [];
        public FilaEmail FilaEmail { get; set; } = null!;
    }
}
