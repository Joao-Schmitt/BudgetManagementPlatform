using Budgets.Application.Email.Interfaces;

namespace Budgets.Api.BackgroundServices
{
    public class EmailBackgroundService : BackgroundService
    {
        private readonly ILogger<EmailBackgroundService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public EmailBackgroundService(IServiceScopeFactory scopeFactory, ILogger<EmailBackgroundService> logger)
        {
            _logger = logger;   
            _scopeFactory = scopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var filaEmailService = scope.ServiceProvider
                        .GetRequiredService<IFilaEmailService>();

                    await filaEmailService.ProcessPendingAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Serviço da fila de emails encerrado");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Falha na execução da fila de emails");
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}
