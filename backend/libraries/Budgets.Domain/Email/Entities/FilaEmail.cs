using Budgets.Shared.Abstractions;

namespace Budgets.Domain.Email.Entities
{
    public class FilaEmail : Entity
    {
        public string Destinatario { get; set; } = string.Empty;
        public string Assunto { get; set; } = string.Empty;
        public string Conteudo { get; set; } = string.Empty;
        public FilaEmailSituacao Situacao { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
        public ICollection<FilaEmailAnexo> Anexos { get; set; } = [];
    }
}
