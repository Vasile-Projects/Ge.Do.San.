import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import qrcode from 'qrcode-generator';

// Margine bianco attorno al codice, in moduli: lo standard ne chiede 4 perché i lettori lo
// distinguano dallo sfondo.
const MARGINE = 4;

// QR code di un link, disegnato come SVG: resta nitido a qualsiasi dimensione.
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
})
export class QrCode {
  readonly url = input.required<string>();
  readonly label = input.required<string>();

  protected readonly codice = computed(() => {
    const qr = qrcode(0, 'M');
    qr.addData(this.url());
    qr.make();
    const moduli = qr.getModuleCount();
    // Un quadratino 1×1 per ogni modulo scuro, tutti in un solo path.
    let d = '';
    for (let r = 0; r < moduli; r++) {
      for (let c = 0; c < moduli; c++) {
        if (qr.isDark(r, c)) d += `M${c + MARGINE} ${r + MARGINE}h1v1h-1z`;
      }
    }
    return { lato: moduli + 2 * MARGINE, d };
  });
}
