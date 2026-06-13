import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { HomePage } from './home.page';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: HomePage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview.page').then((m) => m.OverviewPage),
        data: {
          title: 'Inicio',
          description: 'Visao geral do workspace e dos atalhos principais.'
        }
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('../customers/pages/customer-list/customer-list.page').then((m) => m.CustomerListPage),
        data: {
          title: 'Clientes',
          description: 'Cadastre, edite e acompanhe os clientes ativos da operacao.'
        }
      },
      {
        path: 'establishments',
        loadComponent: () =>
          import('../establishments/pages/establishment-list/establishment-list.page').then(
            (m) => m.EstablishmentListPage
          ),
        data: {
          title: 'Estabelecimentos',
          description: 'Gerencie os dados da empresa, identidade e contatos principais.'
        }
      },
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('../payment-methods/pages/payment-method-list/payment-method-list.page').then(
            (m) => m.PaymentMethodListPage
          ),
        data: {
          title: 'Formas de pagamento',
          description: 'Controle as formas de pagamento disponiveis na operacao.'
        }
      },
      {
        path: 'services',
        loadComponent: () =>
          import('../services/pages/service-list/service-list.page').then((m) => m.ServiceListPage),
        data: {
          title: 'Servicos',
          description: 'Cadastre e organize os servicos comercializados.'
        }
      },
      {
        path: 'vendors',
        loadComponent: () => import('../vendors/pages/vendor-list/vendor-list.page').then((m) => m.VendorListPage),
        data: {
          title: 'Vendedores',
          description: 'Gerencie os vendedores e suas comissoes padrao.'
        }
      },
      {
        path: 'products',
        loadComponent: () => import('../products/pages/product-list/product-list.page').then((m) => m.ProductListPage),
        data: {
          title: 'Produtos',
          description: 'Cadastre e organize os produtos comercializados.'
        }
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage),
        data: {
          title: 'Orcamentos',
          description: 'Espaco reservado para pipeline comercial e propostas.'
        }
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/pages/settings/settings.page').then((m) => m.SettingsPage),
        data: {
          title: 'Configuracoes',
          description: 'Configuracoes da conta, seguranca e preferencias.'
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
