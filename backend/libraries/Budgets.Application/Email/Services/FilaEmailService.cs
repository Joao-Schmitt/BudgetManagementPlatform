using Budgets.Application.Email.Interfaces;
using Budgets.Application.Email.Models;
using Budgets.Domain.Email.Entities;
using Budgets.Domain.Email.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using System.Net.NetworkInformation;
using FilaEmailEntity = Budgets.Domain.Email.Entities.FilaEmail;

namespace Budgets.Application.Email.Services
{
    public class FilaEmailService : IFilaEmailService
    {
        private readonly IFilaEmailRepository _filaEmailRepository;
        private readonly IFilaEmailAnexoRepository _filaEmailAnexoRepository;
        private readonly IEmailQueueSender _emailQueueSender;
        private readonly IUnitOfWork _uow;

        public FilaEmailService(
            IUnitOfWork uow,
            IFilaEmailRepository filaEmailRepository,
            IFilaEmailAnexoRepository filaEmailAnexoRepository,
            IEmailQueueSender emailQueueSender)
        {
            _uow = uow;
            _filaEmailRepository = filaEmailRepository;
            _filaEmailAnexoRepository = filaEmailAnexoRepository;
            _emailQueueSender = emailQueueSender;
        }

        public async Task<Result<FilaEmailEntity>> CreateAsync(CreateFilaEmailArgs args)
        {
            if (args is null)
                return Result<FilaEmailEntity>.Fail("Argumentos invalidos.");

            if (string.IsNullOrWhiteSpace(args.Destinatario))
                return Result<FilaEmailEntity>.Fail("Destinatario e obrigatorio.");

            if (string.IsNullOrWhiteSpace(args.Assunto))
                return Result<FilaEmailEntity>.Fail("Assunto e obrigatorio.");

            if (string.IsNullOrWhiteSpace(args.Conteudo))
                return Result<FilaEmailEntity>.Fail("Conteudo e obrigatorio.");

            var anexosValidation = ValidateAnexos(args.Anexos ?? []);
            if (!anexosValidation.Success)
                return Result<FilaEmailEntity>.Fail(anexosValidation.Error!);

            var filaEmail = new FilaEmailEntity
            {
                Destinatario = args.Destinatario.Trim(),
                Assunto = args.Assunto.Trim(),
                Conteudo = args.Conteudo,
                Situacao = FilaEmailSituacao.Pendente,
                CriadoEm = DateTime.UtcNow
            };

            _filaEmailRepository.Create(filaEmail);

            // Anexos
            if (args.Anexos != null)
            {
                foreach (var anexo in args.Anexos)
                {
                    var filaEmailAnexo = new FilaEmailAnexo
                    {
                        FilaEmailId = filaEmail.Id,
                        NomeArquivo = anexo.NomeArquivo.Trim(),
                        TipoConteudo = anexo.TipoConteudo.Trim(),
                        Conteudo = anexo.Conteudo,
                        FilaEmail = filaEmail
                    };

                    _filaEmailAnexoRepository.Create(filaEmailAnexo);
                    filaEmail.Anexos.Add(filaEmailAnexo);
                }
            }

            await _uow.CommitAsync();

            return Result<FilaEmailEntity>.Ok(filaEmail);
        }

        public async Task<Result<IEnumerable<FilaEmailEntity>>> GetAllAsync()
        {
            var filas = await _filaEmailRepository.GetAllAsync(x => true, readOnly: true);
            return Result<IEnumerable<FilaEmailEntity>>.Ok(filas);
        }

        public async Task<Result<IEnumerable<FilaEmailEntity>>> GetBySituacaoAsync(FilaEmailSituacao situacao)
        {
            var filas = await _filaEmailRepository.GetAllAsync(x => x.Situacao == situacao, readOnly: true);
            return Result<IEnumerable<FilaEmailEntity>>.Ok(filas);
        }

        public async Task<Result<FilaEmailEntity>> GetByIdAsync(Guid id)
        {
            var filaEmail = await _filaEmailRepository.FirstOrDefaultAsync(x => x.Id == id, readOnly: true);

            if (filaEmail is null)
                return Result<FilaEmailEntity>.Fail("Fila de email nao encontrada.");

            var anexos = await _filaEmailAnexoRepository.GetAllAsync(x => x.FilaEmailId == id, readOnly: true);
            filaEmail.Anexos = anexos.ToList();

            return Result<FilaEmailEntity>.Ok(filaEmail);
        }

        public async Task ProcessPendingAsync(CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            foreach (var email in await GetPending())
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {    
                    var sendResult = await _emailQueueSender.SendAsync(email, cancellationToken);

                    var status = (sendResult.Success ? FilaEmailSituacao.Enviado : FilaEmailSituacao.Falha);

                    await UpdateSituacaoAsync(email.Id, new UpdateFilaEmailSituacaoArgs(status));
                }
                catch
                {
                    await UpdateSituacaoAsync(email.Id, new UpdateFilaEmailSituacaoArgs(FilaEmailSituacao.Falha));
                }
            }
        }

        private async Task<List<FilaEmail>> GetPending()
        {
            var pendentes = _filaEmailRepository.GetAll(x => x.Situacao == FilaEmailSituacao.Pendente)
                                                 .ToList();

            pendentes.ForEach(x =>
            {
                x.Situacao = FilaEmailSituacao.Enviando;
                _filaEmailRepository.Update(x);
            });

            await _uow.CommitAsync();

            return pendentes;
        }

        private async Task UpdateSituacaoAsync(Guid id, UpdateFilaEmailSituacaoArgs args)
        {
            if (args is null)
                throw new Exception("Argumentos invalidos.");

            var filaEmail = await _filaEmailRepository.FirstOrDefaultAsync(x => x.Id == id);

            if (filaEmail is null)
                throw new Exception("Fila de email nao encontrada.");

            filaEmail.Situacao = args.Situacao;
            filaEmail.AtualizadoEm = DateTime.UtcNow;

            _filaEmailRepository.Update(filaEmail);
            await _uow.CommitAsync();
        }

        private static Result ValidateAnexos(IReadOnlyCollection<CreateFilaEmailAnexoArgs> anexos)
        {
            foreach (var anexo in anexos)
            {
                if (string.IsNullOrWhiteSpace(anexo.NomeArquivo))
                    return Result.Fail("Nome do anexo e obrigatorio.");

                if (string.IsNullOrWhiteSpace(anexo.TipoConteudo))
                    return Result.Fail("Tipo de conteudo do anexo e obrigatorio.");

                if (anexo.Conteudo is null || anexo.Conteudo.Length == 0)
                    return Result.Fail("Conteudo do anexo e obrigatorio.");
            }

            return Result.Ok();
        }
    }
}
