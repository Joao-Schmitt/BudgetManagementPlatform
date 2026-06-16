import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSkeletonComponent } from '@/shared/components/skeleton/skeleton.component';

import {
  TemplateOrcamentoFormValue,
  TemplateOrcamentoMacro,
  TemplateOrcamentoUpsertRequest,
} from '../../models/template-orcamento.model';
import { TemplateOrcamentoService } from '../../services/template-orcamento.service';

@Component({
  selector: 'app-template-orcamento-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardEmptyComponent,
    ZardInputDirective,
    ZardSkeletonComponent,
  ],
  templateUrl: './template-orcamento-form-modal.component.html',
  styleUrl: './template-orcamento-form-modal.component.scss'
})
export class TemplateOrcamentoFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly templateOrcamentoService = inject(TemplateOrcamentoService);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<TemplateOrcamentoFormValue | null>(null);
  readonly submitForm = output<TemplateOrcamentoUpsertRequest>();
  readonly close = output<void>();
  protected readonly macros = signal<TemplateOrcamentoMacro[]>([]);
  protected readonly macrosLoading = signal(true);
  protected readonly macrosError = signal<string | null>(null);
  protected readonly macroSkeletonRows = [1, 2, 3, 4];

  protected readonly form = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    descricao: ['', [Validators.maxLength(500)]],
    html: ['', [Validators.required]]
  });

  constructor() {
    this.loadMacros();

    effect(() => {
      const value = this.initialValue();

      this.form.reset(value ?? this.createEmptyValue());
    });

    this.form.controls.titulo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const trimmed = value.trimStart();

        if (value !== trimmed) {
          this.form.controls.titulo.setValue(trimmed, { emitEvent: false });
        }
      });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.buildRequest());
  }

  protected hasError(controlName: keyof TemplateOrcamentoFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): TemplateOrcamentoUpsertRequest {
    const value = this.form.getRawValue();

    return {
      titulo: value.titulo.trim(),
      descricao: this.toOptional(value.descricao),
      html: value.html
    };
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private loadMacros(): void {
    this.macrosLoading.set(true);
    this.macrosError.set(null);

    this.templateOrcamentoService
      .getAllMacros()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.macrosLoading.set(false)),
      )
      .subscribe({
        next: (macros) => this.macros.set(macros),
        error: () => {
          this.macros.set([]);
          this.macrosError.set('Nao foi possivel carregar as macros disponiveis.');
        },
      });
  }

  private createEmptyValue(): TemplateOrcamentoFormValue {
    return {
      titulo: '',
      descricao: '',
      html: ''
    };
  }
}
