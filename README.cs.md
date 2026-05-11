# Audio Library

> 🇬🇧 English version: [README.md](./README.md)

Interaktivní hudební knihovna postavená nad TypeScriptem a čtyřmi pilíři objektově orientovaného programování.

## Rychlé spuštění

```bash
npm install
npm run build       # přeloží src/*.ts → dist/*.js
npm run serve       # spustí lokální HTTP server na portu 5173
```

Otevři <http://localhost:5173>, pak **F12 → Console** — uvidíš polymorfní výstup.

Případně lze přeložený výstup pustit přímo přes Node:

```bash
node dist/main.js
```

## Struktura projektu

```
src/                       # TypeScript zdroj
├── models/
│   ├── AudioItem.ts       # abstraktní bázová třída
│   ├── Track.ts           # hudební skladba (192 kbps)
│   └── Podcast.ts         # podcastová epizoda (64 kbps, progres)
├── data.ts                # katalog (instance tříd)
└── main.ts                # konzolové demo (polymorfismus)

dist/                      # JavaScript výstup (commitnuto pro kontrolu)
├── models/
│   ├── AudioItem.js
│   ├── Track.js
│   └── Podcast.js
├── data.js
└── main.js
```

## OOP pilíře v kódu

- **Abstrakce** — `abstract class AudioItem` se dvěma abstraktními metodami. Z `AudioItem` nelze přímo vytvořit instanci.
- **Zapouzdření** — `protected` atributy v rodičovské třídě, `private` atributy v potomcích. `_progress` je chráněný setterem, který ořezává hodnotu do rozsahu `0–1`.
- **Dědičnost** — `class Track extends AudioItem`, `class Podcast extends AudioItem`, volání `super()` v konstruktorech.
- **Polymorfismus** — jedno pole `AudioItem[]` obsahuje mix instancí `Track` a `Podcast`. Cyklus v `main.ts` volá `getInfo()` a `calculateSize()` jednotně, bez rozlišování typu za běhu.

## Dokumentace

Část I. (teoretický rozbor) je v [`docs/Audio_Library_Cast_I.docx`](./docs/Audio_Library_Cast_I.docx).
UML diagram tříd je v [`docs/uml-diagram.png`](./docs/uml-diagram.png).

## Licence

MIT — viz [LICENSE](./LICENSE).
