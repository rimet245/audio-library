import { catalog } from "./data.js";
import { Library } from "./Library.js";
import { AudioItem } from "./models/AudioItem.js";
import { Track } from "./models/Track.js";
import { Podcast } from "./models/Podcast.js";

/**
 * Vstupní bod aplikace — interaktivní webové rozhraní.
 *
 * Nahrazuje původní výpis do konzole. Knihovnu (Library) plní daty z katalogu
 * a vykresluje je jako karty. Uživatel může přidávat nové položky formulářem,
 * měnit progres podcastů posuvníkem a položky odebírat — výstupy se pokaždé
 * okamžitě přepočítají a překreslí, bez znovunačtení stránky.
 *
 * Polymorfismus: vykreslování i součty pracují s typem `AudioItem` a volají
 * `getInfo()`, `formatDuration()`, `calculateSize()` jednotně. Konkrétní typ
 * (Track / Podcast) řešíme jen tam, kde se UI opravdu liší (posuvník progresu).
 */

// Knihovna naplněná počátečními daty z katalogu.
const library = new Library(catalog);

// Aktuální filtr seznamu (jen zobrazení, neovlivňuje obsah knihovny).
type Filter = "all" | "track" | "podcast";
let currentFilter: Filter = "all";

// --- Pomocné funkce -------------------------------------------------------

/** Najde prvek podle id, nebo srozumitelně spadne (kdyby chyběl v HTML). */
function need<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`V HTML chybí prvek s id="${id}".`);
  }
  return node as T;
}

/** Zkratka pro vytvoření prvku s třídou a textem. */
function el(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Naformátuje sekundy na h:mm:ss (nebo m:ss, když je to pod hodinu). */
function formatTotal(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = s.toString().padStart(2, "0");
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

// --- Reference na prvky v HTML -------------------------------------------

const form = need<HTMLFormElement>("add-form");
const typeSelect = need<HTMLSelectElement>("item-type");
const titleInput = need<HTMLInputElement>("item-title");
const authorInput = need<HTMLInputElement>("item-author");
const minutesInput = need<HTMLInputElement>("item-minutes");
const secondsInput = need<HTMLInputElement>("item-seconds");
const genreField = need<HTMLDivElement>("genre-field");
const genreInput = need<HTMLInputElement>("item-genre");

const catalogEl = need<HTMLDivElement>("catalog");
const filtersEl = need<HTMLDivElement>("filters");

const statCount = need<HTMLElement>("stat-count");
const statDuration = need<HTMLElement>("stat-duration");
const statSize = need<HTMLElement>("stat-size");

// --- Vykreslování ---------------------------------------------------------

/** Postaví jednu kartu pro položku. Index slouží k jejímu odebrání. */
function createCard(item: AudioItem, index: number): HTMLElement {
  const isPodcast = item instanceof Podcast;

  const card = el("article", `card ${isPodcast ? "card--podcast" : "card--track"}`);

  const head = el("header", "card__head");
  head.appendChild(el("span", "badge", isPodcast ? "Podcast" : "Skladba"));

  const removeBtn = el("button", "card__remove", "Odebrat") as HTMLButtonElement;
  removeBtn.type = "button";
  removeBtn.addEventListener("click", () => {
    library.remove(index);
    render();
  });
  head.appendChild(removeBtn);
  card.appendChild(head);

  // Popis přes polymorfní getInfo() — karta neřeší, o jaký typ jde.
  const info = el("p", "card__info", item.getInfo());
  card.appendChild(info);

  const meta = el("div", "card__meta");
  meta.appendChild(el("span", undefined, `Délka: ${item.formatDuration()}`));
  meta.appendChild(
    el("span", undefined, `Velikost: ${item.calculateSize().toFixed(2)} MB`),
  );
  card.appendChild(meta);

  // Posuvník progresu jen pro podcasty — jediné místo, kde se UI liší podle typu.
  if (item instanceof Podcast) {
    card.appendChild(buildProgress(item, info));
  }

  return card;
}

/** Sestaví ovládání progresu (posuvník + vizuální pruh) pro podcast. */
function buildProgress(podcast: Podcast, info: HTMLElement): HTMLElement {
  const wrap = el("div", "progress");

  const slider = el("input", "progress__slider") as HTMLInputElement;
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = String(Math.round(podcast.progress * 100));

  const bar = el("div", "progress__bar");
  const fill = el("div", "progress__fill");
  fill.style.width = `${podcast.progress * 100}%`;
  bar.appendChild(fill);

  slider.addEventListener("input", () => {
    // Hodnota jde přes setter třídy Podcast — ten ji ohlídá v rozsahu 0–1.
    podcast.progress = Number(slider.value) / 100;
    const pct = Math.round(podcast.progress * 100);
    fill.style.width = `${pct}%`;
    info.textContent = podcast.getInfo(); // polymorfní přepočet popisu
  });

  wrap.appendChild(slider);
  wrap.appendChild(bar);
  return wrap;
}

/** Vykreslí seznam karet podle aktuálního filtru. */
function renderCatalog(): void {
  catalogEl.replaceChildren();

  const items = library.getAll();
  const visible = items.filter((item) => {
    if (currentFilter === "track") return item instanceof Track;
    if (currentFilter === "podcast") return item instanceof Podcast;
    return true;
  });

  if (visible.length === 0) {
    catalogEl.appendChild(el("p", "empty", "Žádné položky k zobrazení."));
    return;
  }

  visible.forEach((item) => {
    // Index hledáme v původním poli, aby odebrání trefilo správnou položku.
    const index = items.indexOf(item);
    catalogEl.appendChild(createCard(item, index));
  });
}

/** Přepočítá a vypíše souhrn za celou knihovnu. */
function renderSummary(): void {
  statCount.textContent = String(library.count);
  statDuration.textContent = formatTotal(library.totalDuration());
  statSize.textContent = `${library.totalSize().toFixed(2)} MB`;
}

/** Překreslí vše naráz — voláme po každé změně. */
function render(): void {
  renderCatalog();
  renderSummary();
}

// --- Formulář pro přidání položky -----------------------------------------

/** Zobrazí pole „žánr" jen pro skladby. */
function syncGenreField(): void {
  genreField.hidden = typeSelect.value !== "track";
}

typeSelect.addEventListener("change", syncGenreField);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const minutes = Number(minutesInput.value) || 0;
  const seconds = Number(secondsInput.value) || 0;
  const duration = minutes * 60 + seconds;

  if (!title || !author || duration <= 0) {
    return; // prázdné pole nebo nulová délka — nic nepřidáváme
  }

  let item: AudioItem;
  if (typeSelect.value === "podcast") {
    item = new Podcast(title, author, duration, 0);
  } else {
    const genre = genreInput.value.trim() || "neuvedeno";
    item = new Track(title, author, duration, genre);
  }

  library.add(item);
  form.reset();
  syncGenreField();
  render();
});

// --- Filtr ----------------------------------------------------------------

filtersEl.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const value = target.dataset.filter as Filter | undefined;
  if (!value) return;

  currentFilter = value;
  filtersEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === value);
  });
  renderCatalog();
});

// --- Start ----------------------------------------------------------------

syncGenreField();
render();
