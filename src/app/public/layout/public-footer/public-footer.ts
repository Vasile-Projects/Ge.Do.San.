import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trasfusionale } from '../../../shared/models';
import { Icon } from '../../../shared/ui';
import { formattaTelefono } from '../../../shared/format/telefono';

interface ContattoCentro {
  readonly id: number;
  readonly nome: string;
  readonly indirizzo: string;
  readonly telefono: string | null;
  readonly telefonoFormattato: string | null;
}

@Component({
  selector: 'app-public-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.css',
})
export class PublicFooter {
  readonly centri = input<readonly Trasfusionale[]>([]);
  readonly contattiIndisponibili = input(false);
  protected readonly anno = new Date().getFullYear();

  protected readonly contatti = computed<readonly ContattoCentro[]>(() =>
    this.centri().map((c) => {
      const via = c.civico != null ? `${c.indirizzo}, ${c.civico}` : c.indirizzo;
      return {
        id: c.id,
        nome: c.nome,
        indirizzo: `${via} — ${c.citta}`,
        telefono: c.telefono,
        telefonoFormattato: c.telefono ? formattaTelefono(c.telefono) : null,
      };
    }),
  );
}
