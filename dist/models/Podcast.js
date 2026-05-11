import { AudioItem } from "./AudioItem.js";
/**
 * Podcastová epizoda — potomek AudioItem.
 *
 * Specifický atribut je _progress (0 = začátek, 1 = doposlechnuto).
 * Atribut je chráněný setterem, který drží hodnotu v rozsahu 0–1
 * pomocí Math.max/min. I volání `this.progress = progress` v konstruktoru
 * projde stejnou validací, takže nelze obejít.
 *
 * Velikost se počítá z bitrate 64 kbps — mluvené slovo se ukládá
 * v menší kvalitě než hudba.
 */
export class Podcast extends AudioItem {
    constructor(title, author, duration, progress) {
        super(title, author, duration);
        this._progress = 0;
        this.progress = progress; // jde přes setter — validace se uplatní
    }
    get progress() {
        return this._progress;
    }
    /** Setter s validací — drží hodnotu v rozsahu 0–1. */
    set progress(value) {
        this._progress = Math.max(0, Math.min(1, value));
    }
    /** Textový popis epizody s aktuálním progresem v procentech. */
    getInfo() {
        return `[Podcast] ${this.title} — ${this.author} (${Math.round(this._progress * 100)} %)`;
    }
    /** Velikost v MB při 64 kbps: (sekundy × kbps) / 8 / 1024. */
    calculateSize() {
        return (this.duration * 64) / 8 / 1024;
    }
}
