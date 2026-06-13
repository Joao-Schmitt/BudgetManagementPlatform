import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ZardCardComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss'
})
export class AuthShellComponent {
  readonly eyebrow = input<string>('Budgets');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly alternateLabel = input<string | null>(null);
  readonly alternateLink = input<string | null>(null);
  readonly alternateText = input<string | null>(null);
}
