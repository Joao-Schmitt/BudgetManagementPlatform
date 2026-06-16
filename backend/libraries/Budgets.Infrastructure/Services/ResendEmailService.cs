using Budgets.Application.Email.Interfaces;
using Budgets.Domain.Email.Entities;
using Budgets.Domain.Email.Interfaces;
using Budgets.Shared.Results;
using Microsoft.Extensions.Configuration;
using Resend;

namespace Budgets.Infrastructure.Services
{
    public class ResendEmailService : IEmailQueueSender
    {
        private readonly IResend _resend;
        private readonly IConfiguration _configuration;
        private readonly IFilaEmailAnexoRepository _filaEmailAnexoRepository;

        public ResendEmailService(IResend resend, IConfiguration configuration, IFilaEmailAnexoRepository filaEmailAnexoRepository)
        {
            _resend = resend;
            _configuration = configuration;
            _filaEmailAnexoRepository = filaEmailAnexoRepository;
        }

        public async Task<Result> SendAsync(FilaEmail email, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email.Destinatario))
                throw new Exception("Destinatário não informado.");

            if (string.IsNullOrWhiteSpace(email.Assunto))
                throw new Exception("Assunto não informado.");

            if (string.IsNullOrWhiteSpace(email.Conteudo))
                throw new Exception("Conteúdo não informado.");

            var message = new EmailMessage
            {
                From = _configuration["Email:From"] ?? "",
                Subject = email.Assunto,
                HtmlBody = email.Conteudo
            };

            message.To.Add(email.Destinatario);
            message.Attachments = new List<EmailAttachment>();

            foreach (var anexo in _filaEmailAnexoRepository.GetAll(x => x.FilaEmailId == email.Id)
                                                           .ToList())
            {
                message?.Attachments?.Add(new EmailAttachment
                {
                    Filename = anexo.NomeArquivo,
                    ContentType = anexo.TipoConteudo,
                    Content = Convert.ToBase64String(anexo.Conteudo)
                });
            }

            var result = await _resend.EmailSendAsync(message ?? new EmailMessage(), cancellationToken);

            if (!result.Success)
                return Result.Fail(result?.Exception?.Message?? "");

            return Result.Ok();
        }
    }
}
