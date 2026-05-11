import { AudioItem } from "./AudioItem";

/**
 * Hudební skladba — potomek AudioItem.
 *
 * Specifický atribut je žánr (private — viditelný jen uvnitř této třídy).
 * Velikost se počítá z fixní kvality 192 kbps, která odpovídá standardní
 * bitrate hudebních nahrávek.
 */
export class Track extends AudioItem {
  constructor(
    title: string,
    author: string,
    duration: number,
    private genre: string,
  ) {
    super(title, author, duration);
  }

  /** Textový popis skladby pro výpis v konzoli. */
  getInfo(): string {
    return `[Track] ${this.title} — ${this.author} (${this.genre})`;
  }

  /** Velikost v MB při 192 kbps: (sekundy × kbps) / 8 / 1024. */
  calculateSize(): number {
    return (this.duration * 192) / 8 / 1024;
  }
}
