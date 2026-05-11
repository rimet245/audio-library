import { catalog } from "./data";

/**
 * Vstupní bod aplikace — test v konzoli.
 *
 * Polymorfismus v praxi: cyklus iteruje přes `AudioItem[]` s mixem Tracků
 * a Podcastů. Pro každou položku se volá `getInfo()`, `formatDuration()`
 * a `calculateSize()`. Volající kód neví ani se neptá, jestli jde o Track
 * nebo Podcast — každý objekt si zavolá svou vlastní implementaci.
 */
catalog.forEach((item) => {
  console.log(
    `${item.getInfo()} | ${item.formatDuration()} | ${item.calculateSize().toFixed(2)} MB`,
  );
});
