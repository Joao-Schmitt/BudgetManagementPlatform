using Budgets.Application.Email.Interfaces;
using Budgets.Application.Email.Models;
using Budgets.Application.Orcamento.Interfaces;
using Budgets.Application.Orcamento.Models;
using Budgets.Domain.Cliente.Entities;
using Budgets.Domain.Cliente.Interfaces;
using Budgets.Domain.Estabelecimento.Entities;
using Budgets.Domain.Estabelecimento.Interfaces;
using Budgets.Domain.FormaPagamento.Entities;
using Budgets.Domain.FormaPagamento.Interfaces;
using Budgets.Domain.Orcamento.Entities;
using Budgets.Domain.Orcamento.Interfaces;
using Budgets.Domain.Produto.Entities;
using Budgets.Domain.Produto.Interfaces;
using Budgets.Domain.Servico.Entities;
using Budgets.Domain.Servico.Interfaces;
using Budgets.Domain.Template.Entities;
using Budgets.Domain.Template.Interfaces;
using Budgets.Domain.User.Entities;
using Budgets.Domain.User.Interfaces;
using Budgets.Domain.Vendedor.Entities;
using Budgets.Domain.Vendedor.Interfaces;
using Budgets.Shared.Persistence;
using Budgets.Shared.Results;
using System.Globalization;
using System.Net;
using System.Runtime.Intrinsics.Arm;
using System.Text;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;
using OrcamentoEntity = Budgets.Domain.Orcamento.Entities.Orcamento;
using ProdutoEntity = Budgets.Domain.Produto.Entities.Produto;
using ServicoEntity = Budgets.Domain.Servico.Entities.Servico;

namespace Budgets.Application.Orcamento.Services
{
    public class OrcamentoService : IOrcamentoService
    {
        private readonly IOrcamentoRepository _orcamentoRepository;
        private readonly IOrcamentoFormaPagamentoRepository _orcamentoFormaPagamentoRepository;
        private readonly IOrcamentoItemRepository _orcamentoItemRepository;
        private readonly IEstabelecimentoRepository _estabelecimentoRepository;
        private readonly IClienteRepository _clienteRepository;
        private readonly IVendedorRepository _vendedorRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ITemplateOrcamentoRepository _templateOrcamentoRepository;
        private readonly ITemplateOrcamentoMacroRepository _templateOrcamentoMacroRepository;
        private readonly IFormaPagamentoRepository _formaPagamentoRepository;
        private readonly IProdutoRepository _produtoRepository;
        private readonly IServicoRepository _servicoRepository;
        private readonly IHtmlToPdfConverter _htmlToPdfConverter;
        private readonly IFilaEmailService _filaEmailService;
        private readonly IUnitOfWork _uow;

        public OrcamentoService(
            IUnitOfWork uow,
            IOrcamentoRepository orcamentoRepository,
            IOrcamentoFormaPagamentoRepository orcamentoFormaPagamentoRepository,
            IOrcamentoItemRepository orcamentoItemRepository,
            IEstabelecimentoRepository estabelecimentoRepository,
            IClienteRepository clienteRepository,
            IVendedorRepository vendedorRepository,
            IUsuarioRepository usuarioRepository,
            ITemplateOrcamentoRepository templateOrcamentoRepository,
            ITemplateOrcamentoMacroRepository templateOrcamentoMacroRepository,
            IFormaPagamentoRepository formaPagamentoRepository,
            IProdutoRepository produtoRepository,
            IServicoRepository servicoRepository,
            IHtmlToPdfConverter htmlToPdfConverter,
            IFilaEmailService filaEmailService)
        {
            _uow = uow;
            _orcamentoRepository = orcamentoRepository;
            _orcamentoFormaPagamentoRepository = orcamentoFormaPagamentoRepository;
            _orcamentoItemRepository = orcamentoItemRepository;
            _estabelecimentoRepository = estabelecimentoRepository;
            _clienteRepository = clienteRepository;
            _vendedorRepository = vendedorRepository;
            _usuarioRepository = usuarioRepository;
            _templateOrcamentoRepository = templateOrcamentoRepository;
            _templateOrcamentoMacroRepository = templateOrcamentoMacroRepository;
            _formaPagamentoRepository = formaPagamentoRepository;
            _produtoRepository = produtoRepository;
            _servicoRepository = servicoRepository;
            _htmlToPdfConverter = htmlToPdfConverter;
            _filaEmailService = filaEmailService;
        }

        public async Task<Result<OrcamentoEntity>> CreateAsync(CreateOrcamentoArgs args)
        {
            var validation = await ValidateArgsAsync(args);
            if (!validation.Success)
                return Result<OrcamentoEntity>.Fail(validation.Error!);

            var orcamento = new OrcamentoEntity
            {
                EstabelecimentoId = args.EstabelecimentoId,
                ClienteId = args.ClienteId,
                VendedorId = args.VendedorId,
                UsuarioId = args.UsuarioId,
                TemplateOrcamentoId = args.TemplateOrcamentoId,
                Observacoes = args.Observacoes?.Trim() ?? string.Empty,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            _orcamentoRepository.Create(orcamento);
            CreateFormaPagamentos(orcamento, args.FormaPagamentoIds);
            CreateItens(orcamento, args.Itens);

            await _uow.CommitAsync();

            return Result<OrcamentoEntity>.Ok(orcamento);
        }

        public async Task<Result<IEnumerable<OrcamentoEntity>>> GetAllAsync()
        {
            var orcamentos = await _orcamentoRepository.GetAllAsync(x => x.Ativo, readOnly: true);
            return Result<IEnumerable<OrcamentoEntity>>.Ok(orcamentos);
        }

        public async Task<Result<OrcamentoEntity>> GetByIdAsync(Guid id)
        {
            var orcamento = await _orcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);

            if (orcamento is null)
                return Result<OrcamentoEntity>.Fail("Orcamento nao encontrado.");

            var formasPagamento = await _orcamentoFormaPagamentoRepository.GetAllAsync(
                x => x.OrcamentoId == id,
                readOnly: true);

            var itens = await _orcamentoItemRepository.GetAllAsync(x => x.OrcamentoId == id, readOnly: true);

            orcamento.FormasPagamento = formasPagamento.ToList();
            orcamento.Itens = itens.ToList();

            return Result<OrcamentoEntity>.Ok(orcamento);
        }

        public async Task<Result<OrcamentoEntity>> UpdateAsync(Guid id, UpdateOrcamentoArgs args)
        {
            var validation = await ValidateArgsAsync(args);
            if (!validation.Success)
                return Result<OrcamentoEntity>.Fail(validation.Error!);

            var orcamento = await _orcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (orcamento is null)
                return Result<OrcamentoEntity>.Fail("Orcamento nao encontrado.");

            orcamento.EstabelecimentoId = args.EstabelecimentoId;
            orcamento.ClienteId = args.ClienteId;
            orcamento.VendedorId = args.VendedorId;
            orcamento.UsuarioId = args.UsuarioId;
            orcamento.TemplateOrcamentoId = args.TemplateOrcamentoId;
            orcamento.Observacoes = args.Observacoes?.Trim() ?? string.Empty;
            orcamento.AtualizadoEm = DateTime.UtcNow;

            _orcamentoRepository.Update(orcamento);

            _orcamentoFormaPagamentoRepository.RemoveAll(x => x.OrcamentoId == id);
            _orcamentoItemRepository.RemoveAll(x => x.OrcamentoId == id);

            CreateFormaPagamentos(orcamento, args.FormaPagamentoIds);
            CreateItens(orcamento, args.Itens);

            await _uow.CommitAsync();

            return Result<OrcamentoEntity>.Ok(orcamento);
        }

        public async Task<Result<GeneratedOrcamentoFileResult>> GenerateFileAsync(Guid id, OrcamentoFileType fileType, CancellationToken cancellationToken = default)
        {
            if (id == Guid.Empty)
                return Result<GeneratedOrcamentoFileResult>.Fail("Orcamento inválido.");

            var orcamento = await _orcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);
            if (orcamento is null)
                return Result<GeneratedOrcamentoFileResult>.Fail("Orçamento não encontrado.");

            var content = await GetDataBudgetGeneration(orcamento);

            if(!content.Success || content.Value is null)
                return Result<GeneratedOrcamentoFileResult>.Fail(content.Error ?? "Falha ao carregar os dados do orçamento!");

            var data = content.Value;
            var macros = _templateOrcamentoMacroRepository.GetAll().ToList();

            var processedHtml = ReplaceMacros(data.Template.Html, BuildMacroValues(orcamento, data), macros);
            var fileBaseName = BuildFileBaseName(data.Template.Titulo, orcamento.Id);

            if (fileType == OrcamentoFileType.Pdf)
            {
                var pdfContent = await _htmlToPdfConverter.ConvertAsync(processedHtml, cancellationToken);

                return Result<GeneratedOrcamentoFileResult>.Ok(new GeneratedOrcamentoFileResult
                {
                    Content = pdfContent,
                    ContentType = "application/pdf",
                    FileName = $"{fileBaseName}.pdf"
                });
            }

            return Result<GeneratedOrcamentoFileResult>.Ok(new GeneratedOrcamentoFileResult
            {
                Content = Encoding.UTF8.GetBytes(processedHtml),
                ContentType = "text/html; charset=utf-8",
                FileName = $"{fileBaseName}.html"
            });
        }

        private async Task<Result<GenerateOrcamentoArgs>> GetDataBudgetGeneration(OrcamentoEntity orcamento)
        {
            var template = await _templateOrcamentoRepository.FirstOrDefaultAsync(
                x => x.Id == orcamento.TemplateOrcamentoId && x.Ativo,
                readOnly: true);

            if (template is null)
                return Result<GenerateOrcamentoArgs>.Fail("Template de orçamento não encontrado.");

            var cliente = await _clienteRepository.FirstOrDefaultAsync(x => x.Id == orcamento.ClienteId && x.Ativo, readOnly: true);
            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(x => x.Id == orcamento.EstabelecimentoId && x.Ativo, readOnly: true);
            var vendedor = await _vendedorRepository.FirstOrDefaultAsync(x => x.Id == orcamento.VendedorId && x.Ativo, readOnly: true);
            var usuario = await _usuarioRepository.FirstOrDefaultAsync(x => x.Id == orcamento.UsuarioId && x.Ativo, readOnly: true);
           
            if (cliente is null || estabelecimento is null || vendedor is null || usuario is null)
                return Result<GenerateOrcamentoArgs>.Fail("Não foi possivel carregar os dados do orcamento.");

            // Formas de pagamento
            var formasPagamento = new List<GenerateOrcamentoArgsPayments>();
            orcamento.FormasPagamento
                .ToList()
                .ForEach(z =>
                {
                    var formaPagamento = _formaPagamentoRepository.GetById(z.FormaPagamentoId);
                    formasPagamento.Add(new GenerateOrcamentoArgsPayments(formaPagamento, z));
                });

            // Produtos
            var produtos = new List<GenerateOrcamentoArgsProduct>();
            orcamento.Itens
                .Where(x => x.ProdutoId != null && x.ProdutoId != Guid.Empty)
                .ToList()
                .ForEach(z =>
                {
                    var produto = _produtoRepository.GetById(z.ProdutoId ?? Guid.Empty);
                    produtos.Add(new GenerateOrcamentoArgsProduct(produto, z));
                });

            // Serviços
            var servicos = new List<GenerateOrcamentoArgsService>();
            orcamento.Itens
                .Where(x => x.ServicoId != null && x.ServicoId != Guid.Empty)
                .ToList()
                .ForEach(z =>
                {
                    var servico = _servicoRepository.GetById(z.ServicoId ?? Guid.Empty);
                    servicos.Add(new GenerateOrcamentoArgsService(servico, z));
                });

            return Result<GenerateOrcamentoArgs>.Ok(new GenerateOrcamentoArgs(
                estabelecimento,
                cliente,
                vendedor,
                usuario,
                template,
                formasPagamento,
                produtos,
                servicos
            ));
        }

        public async Task<Result<QueueOrcamentoEmailResult>> QueueEmailAsync(Guid id, CancellationToken cancellationToken = default)
        {
            if (id == Guid.Empty)
                return Result<QueueOrcamentoEmailResult>.Fail("Orcamento invalido.");

            var orcamento = await _orcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo, readOnly: true);
            if (orcamento is null)
                return Result<QueueOrcamentoEmailResult>.Fail("Orcamento nao encontrado.");

            var cliente = await _clienteRepository.FirstOrDefaultAsync(x => x.Id == orcamento.ClienteId && x.Ativo, readOnly: true);
            if (cliente is null)
                return Result<QueueOrcamentoEmailResult>.Fail("Cliente do orcamento nao encontrado.");

            if (string.IsNullOrWhiteSpace(cliente.Email))
                return Result<QueueOrcamentoEmailResult>.Fail("O cliente do orcamento nao possui e-mail cadastrado.");

            var generatedFileResult = await GenerateFileAsync(id, OrcamentoFileType.Pdf, cancellationToken);
            if (!generatedFileResult.Success)
                return Result<QueueOrcamentoEmailResult>.Fail(generatedFileResult.Error!);

            var generatedFile = generatedFileResult.Value;
            if (generatedFile is null)
                return Result<QueueOrcamentoEmailResult>.Fail("Nao foi possivel gerar o PDF do orcamento.");

            var filaEmailResult = await _filaEmailService.CreateAsync(new CreateFilaEmailArgs(
                cliente.Email.Trim(),
                $"Orcamento {orcamento.Id}",
                "Segue em anexo o arquivo PDF do orcamento.",
                [
                    new CreateFilaEmailAnexoArgs(
                        generatedFile.FileName,
                        generatedFile.ContentType,
                        generatedFile.Content)
                ]));

            if (!filaEmailResult.Success)
                return Result<QueueOrcamentoEmailResult>.Fail(filaEmailResult.Error!);

            var filaEmail = filaEmailResult.Value;
            if (filaEmail is null)
                return Result<QueueOrcamentoEmailResult>.Fail("Nao foi possivel adicionar o e-mail na fila.");

            return Result<QueueOrcamentoEmailResult>.Ok(new QueueOrcamentoEmailResult
            {
                FilaEmailId = filaEmail.Id,
                Destinatario = filaEmail.Destinatario,
                FileName = generatedFile.FileName
            });
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var orcamento = await _orcamentoRepository.FirstOrDefaultAsync(x => x.Id == id && x.Ativo);

            if (orcamento is null)
                return Result.Fail("Orcamento nao encontrado.");

            orcamento.Ativo = false;
            orcamento.AtualizadoEm = DateTime.UtcNow;

            _orcamentoRepository.Update(orcamento);
            await _uow.CommitAsync();

            return Result.Ok();
        }

        private void CreateFormaPagamentos(OrcamentoEntity orcamento, IReadOnlyCollection<Guid> formaPagamentoIds)
        {
            orcamento.FormasPagamento = formaPagamentoIds
                .Distinct()
                .Select(formaPagamentoId => new OrcamentoFormaPagamento
                {
                    OrcamentoId = orcamento.Id,
                    FormaPagamentoId = formaPagamentoId,
                    Orcamento = orcamento
                })
                .ToList();

            foreach (var formaPagamento in orcamento.FormasPagamento)
                _orcamentoFormaPagamentoRepository.Create(formaPagamento);
        }

        private void CreateItens(OrcamentoEntity orcamento, IReadOnlyCollection<OrcamentoItemArgs> itens)
        {
            orcamento.Itens = itens
                .Select(item => new OrcamentoItem
                {
                    OrcamentoId = orcamento.Id,
                    ProdutoId = item.ProdutoId,
                    ServicoId = item.ServicoId,
                    Quantidade = item.Quantidade,
                    ValorUnitario = item.ValorUnitario,
                    Orcamento = orcamento
                })
                .ToList();

            foreach (var item in orcamento.Itens)
                _orcamentoItemRepository.Create(item);
        }

        private async Task<Result> ValidateArgsAsync(CreateOrcamentoArgs args)
        {
            if (args is null)
                return Result.Fail("Argumentos invalidos.");

            return await ValidateCommonAsync(
                args.EstabelecimentoId,
                args.ClienteId,
                args.VendedorId,
                args.UsuarioId,
                args.TemplateOrcamentoId,
                args.FormaPagamentoIds,
                args.Itens);
        }

        private async Task<Result> ValidateArgsAsync(UpdateOrcamentoArgs args)
        {
            if (args is null)
                return Result.Fail("Argumentos invalidos.");

            return await ValidateCommonAsync(
                args.EstabelecimentoId,
                args.ClienteId,
                args.VendedorId,
                args.UsuarioId,
                args.TemplateOrcamentoId,
                args.FormaPagamentoIds,
                args.Itens);
        }

        private async Task<Result> ValidateCommonAsync(
            Guid estabelecimentoId,
            Guid clienteId,
            Guid vendedorId,
            Guid usuarioId,
            Guid templateOrcamentoId,
            IReadOnlyCollection<Guid> formaPagamentoIds,
            IReadOnlyCollection<OrcamentoItemArgs> itens)
        {
            if (estabelecimentoId == Guid.Empty)
                return Result.Fail("Estabelecimento e obrigatorio.");

            if (clienteId == Guid.Empty)
                return Result.Fail("Cliente e obrigatorio.");

            if (vendedorId == Guid.Empty)
                return Result.Fail("Vendedor e obrigatorio.");

            if (usuarioId == Guid.Empty)
                return Result.Fail("Usuario e obrigatorio.");

            if (templateOrcamentoId == Guid.Empty)
                return Result.Fail("Template de orcamento e obrigatorio.");

            if (itens is null || itens.Count == 0)
                return Result.Fail("Informe ao menos um item para o orcamento.");

            if (formaPagamentoIds is null || formaPagamentoIds.Count == 0)
                return Result.Fail("Informe ao menos uma forma de pagamento.");

            var estabelecimento = await _estabelecimentoRepository.FirstOrDefaultAsync(
                x => x.Id == estabelecimentoId && x.Ativo,
                readOnly: true);

            if (estabelecimento is null)
                return Result.Fail("Estabelecimento nao encontrado.");

            var cliente = await _clienteRepository.FirstOrDefaultAsync(
                x => x.Id == clienteId && x.Ativo,
                readOnly: true);

            if (cliente is null)
                return Result.Fail("Cliente nao encontrado.");

            var vendedor = await _vendedorRepository.FirstOrDefaultAsync(
                x => x.Id == vendedorId && x.Ativo,
                readOnly: true);

            if (vendedor is null)
                return Result.Fail("Vendedor nao encontrado.");

            var usuario = await _usuarioRepository.FirstOrDefaultAsync(
                x => x.Id == usuarioId && x.Ativo,
                readOnly: true);

            if (usuario is null)
                return Result.Fail("Usuario nao encontrado.");

            var templateOrcamento = await _templateOrcamentoRepository.FirstOrDefaultAsync(
                x => x.Id == templateOrcamentoId && x.Ativo,
                readOnly: true);

            if (templateOrcamento is null)
                return Result.Fail("Template de orcamento nao encontrado.");

            foreach (var formaPagamentoId in formaPagamentoIds.Distinct())
            {
                if (formaPagamentoId == Guid.Empty)
                    return Result.Fail("Forma de pagamento invalida.");

                var formaPagamento = await _formaPagamentoRepository.FirstOrDefaultAsync(
                    x => x.Id == formaPagamentoId && x.Ativo,
                    readOnly: true);

                if (formaPagamento is null)
                    return Result.Fail("Forma de pagamento nao encontrada.");
            }

            foreach (var item in itens)
            {
                var itemValidation = await ValidateItemAsync(item);
                if (!itemValidation.Success)
                    return itemValidation;
            }

            return Result.Ok();
        }

        private async Task<Result> ValidateItemAsync(OrcamentoItemArgs item)
        {
            if (item is null)
                return Result.Fail("Item do orcamento invalido.");

            if (item.Quantidade <= 0)
                return Result.Fail("Quantidade do item deve ser maior que zero.");

            if (item.ValorUnitario < 0)
                return Result.Fail("Valor unitario do item invalido.");

            var hasProduto = item.ProdutoId.HasValue && item.ProdutoId.Value != Guid.Empty;
            var hasServico = item.ServicoId.HasValue && item.ServicoId.Value != Guid.Empty;

            if (hasProduto == hasServico)
                return Result.Fail("Cada item deve informar um produto ou um servico.");

            if (hasProduto)
            {
                var produto = await _produtoRepository.FirstOrDefaultAsync(
                    x => x.Id == item.ProdutoId!.Value && x.Ativo,
                    readOnly: true);

                if (produto is null)
                    return Result.Fail("Produto do item nao encontrado.");
            }

            if (hasServico)
            {
                var servico = await _servicoRepository.FirstOrDefaultAsync(
                    x => x.Id == item.ServicoId!.Value && x.Ativo,
                    readOnly: true);

                if (servico is null)
                    return Result.Fail("Servico do item nao encontrado.");
            }

            return Result.Ok();
        }

        public Dictionary<string, string> BuildMacroValues(OrcamentoEntity orcamento, GenerateOrcamentoArgs args)
        {
            var branchName = FirstNotEmpty(args.Estabelecimento.NomeFantasia, args.Estabelecimento.RazaoSocial);
            var sellerBranch = branchName;

            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["HexPrimaryColor"] = "#3c6ade", // TODO: IMPLEMENTAR CONFIGURAÇÃO
                ["HexSecundaryColor"] = "#f2f2f2", // TODO: IMPLEMENTAR CONFIGURAÇÃO
                ["TextClientName"] = args.Cliente.Nome,
                ["TextClientDocument"] = args.Cliente.Documento ?? string.Empty,
                ["TextClientFone"] = args.Cliente.Telefone ?? string.Empty,
                ["TextClientWhatsapp"] = args.Cliente.WhatsApp ?? string.Empty,
                ["TextClientEmail"] = args.Cliente.Email ?? string.Empty,
                ["TextClientAddress"] = BuildAddress(args.Cliente.Logradouro, args.Cliente.Numero, args.Cliente.Complemento, args.Cliente.Bairro, args.Cliente.Cidade, args.Cliente.Uf, args.Cliente.Cep),
                ["TextClientObservation"] = args.Cliente.Observacao ?? string.Empty,
                ["TextSellerName"] = args.Vendedor.Nome,
                ["TextSellerEmail"] = FirstNotEmpty(args.Vendedor.Email, args.Usuario.Email),
                ["TextSellerFone"] = args.Vendedor.Telefone ?? string.Empty,
                ["TextSellerBranch"] = sellerBranch,
                ["TableProducts"] = BuildProductsTable(args.Produtos),
                ["TableServices"] = BuildServicesTable(args.Servicos),
                ["TablePaymentMethods"] = BuildPaymentMethodsTable(args.FormasPagamento),
                ["TextCompanyName"] = args.Estabelecimento.RazaoSocial,
                ["TextCompanyDocument"] = args.Estabelecimento.Cnpj ?? string.Empty,
                ["TextCompanyFone"] = args.Estabelecimento.Telefone ?? string.Empty,
                ["TextCompanyWhatsapp"] = args.Estabelecimento.WhatsApp ?? string.Empty,
                ["TextCompanyEmail"] = args.Estabelecimento.Email ?? string.Empty,
                ["TextBranchName"] = branchName,
                ["TextObservation"] = orcamento.Observacoes ?? string.Empty,
                ["TextBudgetId"] = orcamento.Id.ToString(),
                ["TextDate"] = orcamento.CriadoEm.ToLocalTime().ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                ["TextValidation"] = string.Empty,
                ["TemplateTitle"] = args.Template.Titulo
            };
        }

        private static string ReplaceMacros(string html, IReadOnlyDictionary<string, string> macroValues, IReadOnlyCollection<TemplateOrcamentoMacro> macros)
        {
            if (string.IsNullOrWhiteSpace(html))
                return string.Empty;

            var processedHtml = html;

            foreach (var macro in macros)
            {
                var value = macroValues.TryGetValue(macro.Macro, out var rawValue)
                    ? rawValue ?? string.Empty
                    : string.Empty;

                processedHtml = ReplaceMacroToken(processedHtml, macro.Macro, value);
            }

            return processedHtml;
        }

        private static string ReplaceMacroToken(string html, string macro, string value)
        {
            var tokens = new[]
            {
                $"{{{{{macro}}}}}",
                $"{{{{ {macro} }}}}",
                $"[[{macro}]]",
                $"[[ {macro} ]]",
                $"@{macro}@",
                $"%{macro}%"
            };

            var replaced = html;
            foreach (var token in tokens)
                replaced = replaced.Replace(token, value, StringComparison.OrdinalIgnoreCase);

            return replaced;
        }

        private static string BuildProductsTable(List<GenerateOrcamentoArgsProduct> produtos)
        {
            var productRows = produtos
                .Select(x => new TableRow(
                    x.Item.Codigo ?? "-",
                    x.Item.Nome,
                    x.OrcamentoItem.Quantidade.ToString("0.##", CultureInfo.InvariantCulture),
                    FormatCurrency(x.OrcamentoItem.ValorUnitario),
                    FormatCurrency(x.OrcamentoItem.Quantidade * x.OrcamentoItem.ValorUnitario)))
                .ToList();

            return BuildTableHtml(
                productRows,
                "Nenhum produto vinculado ao orçamento.",
                "Código",
                "Produto",
                "Qtd.",
                "Valor unitário",
                "Total");
        }

        private static string BuildServicesTable(List<GenerateOrcamentoArgsService> services)
        {
            var serviceRows = services
                .Select(x => new TableRow(
                    x.Servico.Codigo ?? "-",
                    x.Servico.Nome,
                    x.OrcamentoItem.Quantidade.ToString("0.##", CultureInfo.InvariantCulture),
                    FormatCurrency(x.OrcamentoItem.ValorUnitario),
                    FormatCurrency(x.OrcamentoItem.Quantidade * x.OrcamentoItem.ValorUnitario)))
                .ToList();

            return BuildTableHtml(
                serviceRows,
                "Nenhum serviço vinculado ao orçamento.",
                "Código",
                "Serviço",
                "Qtd.",
                "Valor unitário",
                "Total");
        }

        private static string BuildPaymentMethodsTable(List<GenerateOrcamentoArgsPayments> formasPagamento)
        {
            var paymentRows = formasPagamento
                .Select((x, index) => new TableRow(
                    (index + 1).ToString(CultureInfo.InvariantCulture),
                    x.FormasPagamentos.Nome,
                    x.FormasPagamentos.Tipo.ToString(),
                    string.Empty,
                    string.Empty))
                .ToList();

            return BuildTableHtml(
                paymentRows,
                "Nenhuma forma de pagamento vinculada ao orçamento.",
                "#",
                "Forma de pagamento",
                "Tipo",
                string.Empty,
                string.Empty);
        }

        private static string BuildTableHtml(IReadOnlyCollection<TableRow> rows, string emptyMessage, params string[] headers)
        {
            if (rows.Count == 0)
                return $"<p>{Encode(emptyMessage)}</p>";

            var builder = new StringBuilder();
            builder.Append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;\">");
            builder.Append("<thead><tr>");

            foreach (var header in headers.Where(x => !string.IsNullOrWhiteSpace(x)))
                builder.Append($"<th style=\"border:1px solid #d4d4d8;padding:8px;background:#f4f4f5;text-align:left;\">{Encode(header)}</th>");

            builder.Append("</tr></thead><tbody>");

            foreach (var row in rows)
            {
                builder.Append("<tr>");
                builder.Append($"<td style=\"border:1px solid #e4e4e7;padding:8px;\">{Encode(row.Column1)}</td>");
                builder.Append($"<td style=\"border:1px solid #e4e4e7;padding:8px;\">{Encode(row.Column2)}</td>");
                builder.Append($"<td style=\"border:1px solid #e4e4e7;padding:8px;\">{Encode(row.Column3)}</td>");

                if (!string.IsNullOrWhiteSpace(headers.ElementAtOrDefault(3)))
                    builder.Append($"<td style=\"border:1px solid #e4e4e7;padding:8px;\">{Encode(row.Column4)}</td>");

                if (!string.IsNullOrWhiteSpace(headers.ElementAtOrDefault(4)))
                    builder.Append($"<td style=\"border:1px solid #e4e4e7;padding:8px;\">{Encode(row.Column5)}</td>");

                builder.Append("</tr>");
            }

            builder.Append("</tbody></table>");
            return builder.ToString();
        }

        private static string BuildAddress(params string?[] parts)
            => string.Join(", ", parts.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x!.Trim()));

        private static string FirstNotEmpty(params string?[] values)
            => values.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x))?.Trim() ?? string.Empty;

        private static string FormatCurrency(decimal value)
            => value.ToString("C2", CultureInfo.GetCultureInfo("pt-BR"));

        private static string Encode(string? value)
            => WebUtility.HtmlEncode(value ?? string.Empty).Replace(Environment.NewLine, "<br />").Replace("\n", "<br />");

        private static string BuildFileBaseName(string templateTitle, Guid orcamentoId)
        {
            var prefix = string.IsNullOrWhiteSpace(templateTitle)
                ? "orcamento"
                : new string(templateTitle
                    .Trim()
                    .Select(ch => char.IsLetterOrDigit(ch) ? char.ToLowerInvariant(ch) : '-')
                    .ToArray());

            while (prefix.Contains("--", StringComparison.Ordinal))
                prefix = prefix.Replace("--", "-", StringComparison.Ordinal);

            return $"{prefix.Trim('-')}-orcamento-{orcamentoId:N}";
        }

        private sealed record TableRow(string Column1, string Column2, string Column3, string Column4, string Column5);
    }
}
