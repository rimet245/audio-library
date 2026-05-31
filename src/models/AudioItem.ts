/**
 * Abstraktní bázová třída pro veškerý audio obsah.
 *
 * Definuje společné atributy (název, autor, délka) a kontrakt, který každý
 * potomek musí naplnit — dvě abstraktní metody `getInfo()` a `calculateSize()`.
 * Sdílená metoda `formatDuration()` patří všem potomkům, proto je tady,
 * a píše se jen jednou.
 *
 * Atributy jsou definované přes "parameter properties" v konstruktoru —
 * TypeScript je automaticky vytvoří jako protected.
 */
export abstract class AudioItem {
  constructor(
    protected title: string,
    protected author: string,
    protected duration: number,
  ) {}

  /**
   * Délka v sekundách, jen pro čtení.
   *
   * Samotný atribut `duration` zůstává protected (zapouzdření), ale Library
   * potřebuje sčítat délky všech položek — proto sem přidávám read-only getter.
   * Zvenčí jde hodnotu přečíst, ale ne přepsat.
   */
  get durationInSeconds(): number {
    return this.duration;
  }

  /** Vrátí délku ve formátu mm:ss. */
  formatDuration(): string {
    const m = Math.floor(this.duration / 60);
    const s = this.duration % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /** Krátký textový popis položky. Implementuje potomek. */
  abstract getInfo(): string;

  /** Velikost souboru v MB. Implementuje potomek. */
  abstract calculateSize(): number;
}
