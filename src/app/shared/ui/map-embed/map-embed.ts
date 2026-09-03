import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-map-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-embed.html',
  styleUrl: './map-embed.css',
})
export class MapEmbed {
  private readonly sanitizer = inject(DomSanitizer);

  readonly query = input.required<string>();
  readonly title = input.required<string>();

  protected readonly src = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(this.query())}&output=embed`,
    ),
  );
}
