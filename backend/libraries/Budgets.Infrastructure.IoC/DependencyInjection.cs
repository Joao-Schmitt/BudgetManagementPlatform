using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Budgets.Infrastructure.Context;
using Budgets.Shared.Persistence;
using Budgets.Application.Auth.Interfaces;
using Budgets.Application.Auth.Services;
using Budgets.Domain.User.Interfaces;
using Budgets.Infrastructure.Repositories;
using Budgets.Infrastructure.Security;
using Budgets.Application.Estabelecimento.Interfaces;
using Budgets.Application.Estabelecimento.Services;
using Budgets.Domain.Estabelecimento.Interfaces;
using Budgets.Application.Cliente.Interfaces;
using Budgets.Application.Cliente.Services;
using Budgets.Domain.Cliente.Interfaces;
using Budgets.Application.Vendedor.Interfaces;
using Budgets.Application.Vendedor.Services;
using Budgets.Domain.Vendedor.Interfaces;
using Budgets.Application.Produto.Interfaces;
using Budgets.Application.Produto.Services;
using Budgets.Domain.Produto.Interfaces;
using Budgets.Application.Servico.Interfaces;
using Budgets.Application.Servico.Services;
using Budgets.Domain.Servico.Interfaces;
using Budgets.Application.FormaPagamento.Interfaces;
using Budgets.Application.FormaPagamento.Services;
using Budgets.Domain.FormaPagamento.Interfaces;
using Budgets.Application.Security.Interfaces;

namespace Budgets.Infrastructure.IoC
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDependencyInjection(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<BudgetsDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IEstabelecimentoService, EstabelecimentoService>();
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<IVendedorService, VendedorService>();
            services.AddScoped<IProdutoService, ProdutoService>();
            services.AddScoped<IServicoService, ServicoService>();
            services.AddScoped<IFormaPagamentoService, FormaPagamentoService>();

            // Repositories
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IEstabelecimentoRepository, EstabelecimentoRepository>();
            services.AddScoped<IClienteRepository, ClienteRepository>();
            services.AddScoped<IVendedorRepository, VendedorRepository>();
            services.AddScoped<IProdutoRepository, ProdutoRepository>();
            services.AddScoped<IServicoRepository, ServicoRepository>();
            services.AddScoped<IFormaPagamentoRepository, FormaPagamentoRepository>();

            return services;

        }
    }
}
