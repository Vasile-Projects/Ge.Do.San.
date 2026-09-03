import { Routes } from '@angular/router';
import { confermaUscitaGuard } from './guards/conferma-uscita.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Gedosan — Prenota la tua donazione di sangue',
  },
  {
    path: 'prenota',
    loadComponent: () => import('./pages/prenota/prenota').then((m) => m.Prenota),
    canDeactivate: [confermaUscitaGuard],
    title: 'Prenota — Gedosan',
  },
  { path: '**', redirectTo: '' },
];
