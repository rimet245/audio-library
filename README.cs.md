# Audio Library

> 🇬🇧 English version: [README.md](./README.md)

Interaktivní hudební knihovna postavená nad TypeScriptem a čtyřmi pilíři objektově orientovaného programování.

## Rychlé spuštění

```bash
npm install
npm run build       # přeloží src/*.ts → dist/*.js
npm run serve       # spustí lokální HTTP server na portu 5173
```

Otevři <http://localhost:5173>. Interaktivní rozhraní umožňuje přidávat skladby
a podcasty přes formulář, měnit progres podcastu posuvníkem, položky odebírat
a filtrovat podle typu — všechny součty se okamžitě přepočítají, bez načítání
stránky.

## Struktura projektu

```
index.html                 # struktura stránky
styles.css                 # responzivní rozvržení (Grid + Flexbox)

src/                       # TypeScript zdroj
├── models/
│   ├── AudioItem.ts       # abstraktní bázová třída
│   ├── Track.ts           # hudební skladba (192 kbps)
│   └── Podcast.ts         # podcastová epizoda (64 kbps, progres)
├── Library.ts             # kolekce nad AudioItem[] (součty, přidání/odebrání)
├── data.ts                # katalog (instance tříd)
└── main.ts                # interaktivní UI (vykreslení do DOM, polymorfismus)

dist/                      # JavaScript výstup (commitnuto pro kontrolu)
├── models/
│   ├── AudioItem.js
│   ├── Track.js
│   └── Podcast.js
├── Library.js
├── data.js
└── main.js
```

## OOP pilíře v kódu

- **Abstrakce** — `abstract class AudioItem` se dvěma abstraktními metodami. Z `AudioItem` nelze přímo vytvořit instanci.
- **Zapouzdření** — `protected` atributy v rodičovské třídě, `private` atributy v potomcích. `_progress` je chráněný setterem, který ořezává hodnotu do rozsahu `0–1`.
- **Dědičnost** — `class Track extends AudioItem`, `class Podcast extends AudioItem`, volání `super()` v konstruktorech.
- **Polymorfismus** — jedno pole `AudioItem[]` (obalené třídou `Library`) obsahuje mix instancí `Track` a `Podcast`. Vykreslování i součty volají `getInfo()`, `formatDuration()` a `calculateSize()` jednotně, bez rozlišování typu za běhu. Konkrétní typ řešíme jen tam, kde se UI opravdu liší (posuvník progresu u podcastu).

## Dokumentace

UML diagram tříd je v [`docs/uml-diagram.png`](./docs/uml-diagram.png).

Psaná dokumentace (Část I–III) se odevzdává samostatně jako PDF a není součástí
tohoto repozitáře (viz `.gitignore`).

## Licence

MIT — viz [LICENSE](./LICENSE).
