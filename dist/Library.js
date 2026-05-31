/**
 * Knihovna — kolekce audio položek.
 *
 * Obaluje pole `AudioItem[]` a poskytuje k němu bezpečné rozhraní:
 * přidání, odebrání, výpis a souhrnné výpočty. Samotné pole je `private`,
 * takže se k němu zvenčí nedá sáhnout přímo — to je zapouzdření.
 *
 * Všechny součty fungují polymorfně: třída neřeší, jestli je položka Track
 * nebo Podcast, jen volá společné metody z AudioItem (`calculateSize()`,
 * `durationInSeconds`). Díky tomu se Library nemusí měnit, ani když přibude
 * nový typ položky.
 */
export class Library {
    constructor(initial = []) {
        this.items = [];
        // Kopie vstupního pole — ať změny v knihovně neovlivní původní data.
        this.items = [...initial];
    }
    /** Přidá novou položku na konec knihovny. */
    add(item) {
        this.items.push(item);
    }
    /** Odebere položku podle indexu. */
    remove(index) {
        this.items.splice(index, 1);
    }
    /** Vrátí všechny položky knihovny (filtrování řeší zobrazovací vrstva). */
    getAll() {
        return this.items;
    }
    /** Počet položek v knihovně. */
    get count() {
        return this.items.length;
    }
    /** Součet délek všech položek v sekundách. */
    totalDuration() {
        return this.items.reduce((sum, item) => sum + item.durationInSeconds, 0);
    }
    /** Součet velikostí všech položek v MB. */
    totalSize() {
        return this.items.reduce((sum, item) => sum + item.calculateSize(), 0);
    }
}
