namespace Budgets.Application.Orcamento.Interfaces
{
    public interface IHtmlToPdfConverter
    {
        Task<byte[]> ConvertAsync(string html, CancellationToken cancellationToken = default);
    }
}
