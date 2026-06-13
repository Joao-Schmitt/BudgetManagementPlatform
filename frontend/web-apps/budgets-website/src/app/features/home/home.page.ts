import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcaseBusiness,
  lucideBuilding2,
  lucideChevronDown,
  lucideCreditCard,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMenu,
  lucidePackage,
  lucideReceiptText,
  lucideSettings,
  lucideUsers
} from '@ng-icons/lucide';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';

import { ZardAvatarComponent } from '@/shared/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDividerComponent } from '@/shared/components/divider/divider.component';

import { AuthStateService } from '../../core/auth/auth-state.service';

type NavigationIcon =
  | 'lucideLayoutDashboard'
  | 'lucideUsers'
  | 'lucideBuilding2'
  | 'lucideCreditCard'
  | 'lucideBriefcaseBusiness'
  | 'lucidePackage'
  | 'lucideReceiptText'
  | 'lucideSettings';

interface NavigationItem {
  label: string;
  route: string;
  icon: NavigationIcon;
}

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon, RouterLink, RouterLinkActive, RouterOutlet, ZardAvatarComponent, ZardButtonComponent, ZardDividerComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  viewProviders: [
    provideIcons({
      lucideBriefcaseBusiness,
      lucideBuilding2,
      lucideChevronDown,
      lucideCreditCard,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMenu,
      lucidePackage,
      lucideReceiptText,
      lucideSettings,
      lucideUsers
    })
  ]
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly authState = inject(AuthStateService);
  protected readonly drawerOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  private readonly routeTitleSignal = signal('Inicio');
  private readonly routeDescriptionSignal = signal('Visao geral dos indicadores e atalhos do workspace.');

  protected readonly navigationItems: NavigationItem[] = [
    { label: 'Inicio', route: '/home/overview', icon: 'lucideLayoutDashboard' },
    { label: 'Clientes', route: '/home/customers', icon: 'lucideUsers' },
    { label: 'Estabelecimentos', route: '/home/establishments', icon: 'lucideBuilding2' },
    { label: 'Formas de pagamento', route: '/home/payment-methods', icon: 'lucideCreditCard' },
    { label: 'Servicos', route: '/home/services', icon: 'lucideBriefcaseBusiness' },
    { label: 'Vendedores', route: '/home/vendors', icon: 'lucideUsers' },
    { label: 'Produtos', route: '/home/products', icon: 'lucidePackage' },
    { label: 'Orcamentos', route: '/home/budgets', icon: 'lucideReceiptText' },
    { label: 'Configuracoes', route: '/home/settings', icon: 'lucideSettings' }
  ];

  protected readonly breadcrumbItems = computed(() => ['Budgets', this.routeTitleSignal()]);
  protected readonly currentSectionTitle = this.routeTitleSignal.asReadonly();
  protected readonly currentSectionDescription = this.routeDescriptionSignal.asReadonly();

  constructor() {
    this.updateRouteMetadata();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateRouteMetadata();
        this.drawerOpen.set(false);
        this.userMenuOpen.set(false);
      });
  }

  protected toggleDrawer(): void {
    this.drawerOpen.update((isOpen) => !isOpen);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.authState.logout();
  }

  private updateRouteMetadata(): void {
    const activeRouteSnapshot = this.findDeepestRouteSnapshot(this.router.routerState.snapshot.root);
    const routeData = activeRouteSnapshot?.routeConfig?.data ?? activeRouteSnapshot?.data ?? {};

    this.routeTitleSignal.set((routeData['title'] as string | undefined) ?? 'Inicio');
    this.routeDescriptionSignal.set(
      (routeData['description'] as string | undefined) ?? 'Visao geral dos indicadores e atalhos do workspace.'
    );
  }

  private findDeepestRouteSnapshot(route: ActivatedRouteSnapshot | null): ActivatedRouteSnapshot | null {
    let currentRoute = route;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return currentRoute;
  }
}
