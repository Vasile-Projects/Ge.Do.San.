import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { lavoroInCorsoGuard } from './guards/lavoro-in-corso.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Accesso operatori — Gedosan',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'prenotazioni' },
      {
        path: 'prenotazioni',
        loadComponent: () =>
          import('./pages/prenotazioni/prenotazioni').then((m) => m.Prenotazioni),
        canDeactivate: [lavoroInCorsoGuard],
        title: 'Prenotazioni — Gedosan Admin',
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/aperture/aperture').then((m) => m.Aperture),
        canDeactivate: [lavoroInCorsoGuard],
        title: 'Gestione calendario — Gedosan Admin',
      },
      {
        path: 'donatori',
        loadComponent: () => import('./pages/donatori/donatori').then((m) => m.Donatori),
        title: 'Donatori — Gedosan Admin',
      },
      {
        path: 'donatori/:id',
        loadComponent: () =>
          import('./pages/donatore-dettaglio/donatore-dettaglio').then(
            (m) => m.DonatoreDettaglioPage,
          ),
        title: 'Scheda donatore — Gedosan Admin',
      },
      { path: 'aperture', redirectTo: 'calendario' },
      { path: 'log', redirectTo: 'prenotazioni' },
      { path: '**', redirectTo: 'prenotazioni' },
    ],
  },
];
