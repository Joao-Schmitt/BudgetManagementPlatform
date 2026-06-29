import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcaseBusiness,
  lucideBuilding2,
  lucideChevronDown,
  lucideCreditCard,
  lucideFileText,
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
  | 'lucideUsers'
  | 'lucideBuilding2'
  | 'lucideCreditCard'
  | 'lucideFileText'
  | 'lucideBriefcaseBusiness'
  | 'lucidePackage'
  | 'lucideReceiptText'
  | 'lucideSettings';

interface NavigationItem {
  label: string;
  route: string;
  icon: NavigationIcon;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
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
      lucideFileText,
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
  private readonly routeTitleSignal = signal('Orcamentos');
  private readonly routeDescriptionSignal = signal('Crie, edite, visualize, baixe e envie os orcamentos da operacao.');

  protected readonly navigationSections: NavigationSection[] = [
    {
      title: 'Geracao',
      items: [{ label: 'Orcamentos', route: '/home/budgets', icon: 'lucideReceiptText' }]
    },
    {
      title: 'Cadastros',
      items: [
        { label: 'Clientes', route: '/home/customers', icon: 'lucideUsers' },
        { label: 'Vendedores', route: '/home/vendors', icon: 'lucideUsers' },
        { label: 'Produtos', route: '/home/products', icon: 'lucidePackage' },
        { label: 'Servicos', route: '/home/services', icon: 'lucideBriefcaseBusiness' },
        { label: 'Estabelecimentos', route: '/home/establishments', icon: 'lucideBuilding2' },
        { label: 'Templates', route: '/home/templates', icon: 'lucideFileText' }
      ]
    },
    {
      title: 'Outros',
      items: [{ label: 'Configuracoes', route: '/home/settings', icon: 'lucideSettings' }]
    }
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

    this.routeTitleSignal.set((routeData['title'] as string | undefined) ?? 'Orcamentos');
    this.routeDescriptionSignal.set(
      (routeData['description'] as string | undefined) ??
        'Crie, edite, visualize, baixe e envie os orcamentos da operacao.'
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
