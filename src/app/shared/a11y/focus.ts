import { afterNextRender } from '@angular/core';

export function portaInVista(elemento: HTMLElement): void {
  afterNextRender(() => {
    elemento.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const titolo = elemento.querySelector<HTMLElement>('h2, h3');
    if (titolo) {
      if (!titolo.hasAttribute('tabindex')) titolo.setAttribute('tabindex', '-1');
      titolo.focus();
    }
  });
}
