import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { Button } from '../../../shared/ui';
import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly inCorso = signal(false);
  protected readonly errore = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.route.snapshot.queryParamMap.get('logout') === '1') {
      this.auth.logout();
    } else if (this.auth.autenticato()) {
      void this.router.navigateByUrl(this.destinazione());
    }
  }

  protected messaggio(campo: 'username' | 'password'): string | null {
    const control = this.form.controls[campo];
    if (!control.touched || !control.errors) return null;
    return 'Campo obbligatorio.';
  }

  protected onSubmit(): void {
    if (this.inCorso()) return;
    this.errore.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() =>
        this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid[formControlName]')?.focus(),
      );
      return;
    }

    this.inCorso.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.inCorso.set(false);
          void this.router.navigateByUrl(this.destinazione());
        },
        error: (e: NormalizedHttpError) => {
          this.inCorso.set(false);
          this.errore.set(this.messaggioErrore(e));
          queueMicrotask(() =>
            this.host.nativeElement.querySelector<HTMLElement>('.login__error')?.focus(),
          );
        },
      });
  }

  private messaggioErrore(e: NormalizedHttpError): string {
    if (e.status === 429) {
      return 'Troppi tentativi di accesso. Riprova tra qualche minuto.';
    }
    if (e.status === 400) {
      return 'Inserisci username e password.';
    }
    if (e.status === 401) {
      return e.message || 'Username o password non validi.';
    }
    return e.message || 'Accesso non riuscito. Riprova.';
  }

  private destinazione(): string {
    const richiesta = this.route.snapshot.queryParamMap.get('redirectTo');
    return richiesta && richiesta.startsWith('/admin') ? richiesta : '/admin';
  }
}
