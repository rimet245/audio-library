import { Track } from "./models/Track.js";
import { Podcast } from "./models/Podcast.js";
/**
 * Katalog dostupných audio položek.
 *
 * Reprezentuje "oficiální nabídku" knihovny — data oddělená od logiky.
 * Pokud chci přidat skladbu nebo podcast, doplním ho sem; zbytek aplikace
 * (typování `AudioItem[]`, polymorfní iterace v main.ts) zůstává netknutý.
 *
 * Délka se zadává v sekundách. Pro Podcast je čtvrtý parametr aktuální
 * progres poslechu (0–1).
 */
export const catalog = [
    new Track("Bohemian Rhapsody", "Queen", 354, "rock"),
    new Track("Imagine", "John Lennon", 183, "pop"),
    new Track("Symfonie č. 9", "Beethoven", 4200, "klasika"),
    new Podcast("Vinohradská 12: Volby v USA", "Český rozhlas", 1800, 0.35),
    new Podcast("Lex Fridman: AI Safety", "Lex Fridman", 7200, 0),
];
