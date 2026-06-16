using Budgets.Application.Email.Interfaces;
using Quartz;

namespace Budgets.Api.Jobs
{
    [DisallowConcurrentExecution]
    public class ProcessarFilaEmailJob : IJob
    {
        private readonly IFilaEmailService _filaEmailService;
        private readonly ILogger<ProcessarFilaEmailJob> _logger;

        public ProcessarFilaEmailJob(IFilaEmailService filaEmailService, ILogger<ProcessarFilaEmailJob> logger)
        {
            _filaEmailService = filaEmailService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
             await _filaEmailService.ProcessPendingAsync(context.CancellationToken);
        }
    }
}
