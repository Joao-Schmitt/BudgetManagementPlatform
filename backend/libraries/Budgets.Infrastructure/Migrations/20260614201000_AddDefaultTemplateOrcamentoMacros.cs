using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Budgets.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultTemplateOrcamentoMacros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                MERGE [TemplateOrcamentoMacro] AS target
                USING (VALUES
                    (NEWID(), N'HexPrimaryColor', N'Hexadecimal da cor primária do template'),
                    (NEWID(), N'HexSecundaryColor', N'Hexadecimal da cor secundária do template'),
                    (NEWID(), N'TextClientName', N'Texto do nome do cliente'),
                    (NEWID(), N'TextClientDocument', N'Texto do documento do cliente'),
                    (NEWID(), N'TextClientFone', N'Texto do telefone do cliente'),
                    (NEWID(), N'TextClientWhatsapp', N'Texto do whatsapp do cliente'),
                    (NEWID(), N'TextClientEmail', N'Texto do email do cliente'),
                    (NEWID(), N'TextClientAddress', N'Texto do endereço do cliente'),
                    (NEWID(), N'TextClientObservation', N'Texto da observação do cliente'),
                    (NEWID(), N'TextSellerName', N'Texto do nome do vendedor'),
                    (NEWID(), N'TextSellerEmail', N'Texto do e-mail do vendedor'),
                    (NEWID(), N'TextSellerFone', N'Texto do telefone do vendedor'),
                    (NEWID(), N'TextSellerBranch', N'Texto da filial do vendedor'),
                    (NEWID(), N'TableProducts', N'Tabela dos produtos'),
                    (NEWID(), N'TableServices', N'Tabela dos serviços'),
                    (NEWID(), N'TablePaymentMethods', N'Tabela das formas de pagamento'),
                    (NEWID(), N'TextCompanyName', N'Texto do nome da empresa'),
                    (NEWID(), N'TextCompanyDocument', N'Texto do documento da empresa'),
                    (NEWID(), N'TextCompanyFone', N'Texto do telefone da empresa'),
                    (NEWID(), N'TextCompanyWhatsapp', N'Texto do WhatsApp da empresa'),
                    (NEWID(), N'TextCompanyEmail', N'Texto do e-mail da empresa'),
                    (NEWID(), N'TextBranchName', N'Texto do nome da filial'),
                    (NEWID(), N'TextObservation', N'Texto das observações'),
                    (NEWID(), N'TextBudgetId', N'Texto do identificador do orçamento'),
                    (NEWID(), N'TextDate', N'Texto da data'),
                    (NEWID(), N'TextValidation', N'Texto da validade')
                ) AS source ([Id], [Macro], [Descricao])
                ON target.[Macro] = source.[Macro]
                WHEN NOT MATCHED BY TARGET THEN
                    INSERT ([Id], [Macro], [Descricao])
                    VALUES (source.[Id], source.[Macro], source.[Descricao]);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM [TemplateOrcamentoMacro]
                WHERE [Macro] IN (
                    N'HexPrimaryColor',
                    N'HexSecundaryColor',
                    N'TextClientName',
                    N'TextClientDocument',
                    N'TextClientFone',
                    N'TextClientWhatsapp',
                    N'TextClientEmail',
                    N'TextClientAddress',
                    N'TextClientObservation',
                    N'TextSellerName',
                    N'TextSellerEmail',
                    N'TextSellerFone',
                    N'TextSellerBranch',
                    N'TableProducts',
                    N'TableServices',
                    N'TablePaymentMethods',
                    N'TextCompanyName',
                    N'TextCompanyDocument',
                    N'TextCompanyFone',
                    N'TextCompanyWhatsapp',
                    N'TextCompanyEmail',
                    N'TextBranchName',
                    N'TextObservation',
                    N'TextBudgetId',
                    N'TextDate',
                    N'TextValidation'
                );
                """);
        }
    }
}
