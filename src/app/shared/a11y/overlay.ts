import { DestroyRef } from '@angular/core';

const SELETTORE_FOCUSABILI =
  'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function comportamentoDialog(
  contenitore: HTMLElement,
  chiudi: () => void,
  destroyRef: DestroyRef,
): void {
  const origine = document.activeElement as HTMLElement | null;

  const focalizzabili = (): HTMLElement[] =>
    Array.from(contenitore.querySelectorAll<HTMLElement>(SELETTORE_FOCUSABILI)).filter(
      (el) => el.offsetParent !== null,
    );

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      chiudi();
      return;
    }
    if (event.key !== 'Tab') return;
    const elementi = focalizzabili();
    if (elementi.length === 0) {
      event.preventDefault();
      return;
    }
    const primo = elementi[0];
    const ultimo = elementi[elementi.length - 1];
    const attivo = document.activeElement;
    if (event.shiftKey && (attivo === primo || !contenitore.contains(attivo))) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && attivo === ultimo) {
      event.preventDefault();
      primo.focus();
    }
  };

  contenitore.addEventListener('keydown', onKeydown);

  queueMicrotask(() => {
    const marcato = contenitore.querySelector<HTMLElement>('[data-autofocus]');
    const target =
      (marcato?.matches(SELETTORE_FOCUSABILI)
        ? marcato
        : (marcato?.querySelector<HTMLElement>(SELETTORE_FOCUSABILI) ?? null)) ??
      focalizzabili()[0];
    target?.focus();
  });

  destroyRef.onDestroy(() => {
    contenitore.removeEventListener('keydown', onKeydown);
    origine?.focus?.();
  });
}
