using Budgets.Application.Orcamento.Interfaces;
using PuppeteerSharp;
using PuppeteerSharp.Media;

namespace Budgets.Infrastructure.Services
{
    public class PuppeteerHtmlToPdfConverter : IHtmlToPdfConverter
    {
        public async Task<byte[]> ConvertAsync(string html, CancellationToken cancellationToken = default)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(html);

            cancellationToken.ThrowIfCancellationRequested();

            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync().WaitAsync(cancellationToken);

            await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            });

            await using var page = await browser.NewPageAsync();
            await page.SetContentAsync(html);

            return await page.PdfDataAsync(new PdfOptions
            {
                Format = PaperFormat.A4,
                PrintBackground = true,
                PreferCSSPageSize = true,
                MarginOptions = new MarginOptions
                {
                    Top = "12mm",
                    Right = "12mm",
                    Bottom = "12mm",
                    Left = "12mm"
                }
            });
        }
    }
}
