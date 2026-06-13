import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ZardBadgeComponent, ZardCardComponent],
  templateUrl: './placeholder.page.html',
  styleUrl: './placeholder.page.scss'
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = (this.route.snapshot.data['title'] as string | undefined) ?? 'Secao';
}
