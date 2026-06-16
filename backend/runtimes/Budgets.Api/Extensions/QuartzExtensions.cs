using Budgets.Api.Jobs;
using Quartz;

namespace Budgets.Api.Extensions
{
    public static class QuartzExtensions
    {
        public static IServiceCollection AddEmailQueueProcessing(this IServiceCollection services)
        {
            var jobKey = new JobKey(nameof(ProcessarFilaEmailJob));

            services.AddQuartz(options =>
            {
                options.AddJob<ProcessarFilaEmailJob>(configure => configure.WithIdentity(jobKey));

                options.AddTrigger(configure => configure
                    .ForJob(jobKey)
                    .WithIdentity($"{nameof(ProcessarFilaEmailJob)}-trigger")
                    .WithSimpleSchedule(schedule => schedule
                        .WithInterval(TimeSpan.FromMinutes(1))
                        .RepeatForever()));
            });

            services.AddQuartzHostedService(options =>
            {
                options.WaitForJobsToComplete = true;
            });

            return services;
        }
    }
}
