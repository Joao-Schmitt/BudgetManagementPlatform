import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChartColumn, lucideShieldCheck, lucideUsers } from '@ng-icons/lucide';

import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, NgIcon, ZardCardComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
  viewProviders: [
    provideIcons({
      lucideChartColumn,
      lucideShieldCheck,
      lucideUsers,
    }),
  ],
})
export class AuthShellComponent {
  readonly eyebrow = input<string>('Budgets');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly wideLayout = input<boolean>(false);
  readonly alternateLabel = input<string | null>(null);
  readonly alternateLink = input<string | null>(null);
  readonly alternateText = input<string | null>(null);
}
