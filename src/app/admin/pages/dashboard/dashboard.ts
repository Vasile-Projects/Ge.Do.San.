import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '../../../shared/ui';
import { AuthService } from '../../data/auth.service';
import { SessionExpired } from '../../components/session-expired/session-expired';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, SessionExpired],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username = this.auth.username;
  protected readonly sessioneScaduta = this.auth.sessioneScaduta;
  protected readonly preavviso = this.auth.preavviso;

  protected readonly modaleRimandata = signal(false);

  protected logout(): void {
    void this.router.navigate(['/admin/login'], { queryParams: { logout: 1 } });
  }

  protected onVaiAlLogin(): void {
    void this.router.navigate(['/admin/login'], { queryParams: { logout: 1 } });
  }

  protected onRestaSullaPagina(): void {
    this.modaleRimandata.set(true);
  }

  protected riapriModale(): void {
    this.modaleRimandata.set(false);
  }
}
