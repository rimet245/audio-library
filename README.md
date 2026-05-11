# Audio Library

Ročníkový projekt — předmět Programování, 2. ročník IT.
Interaktivní hudební knihovna postavená nad TypeScriptem a principy OOP.

## Spuštění

```bash
npm install
npm run dev
```

Aplikace běží na `http://localhost:5173`. Otevři DevTools (F12 → Console) — výstup se vypisuje tam.

## Struktura

```
src/
├── models/
│   ├── AudioItem.ts   — abstraktní bázová třída
│   ├── Track.ts       — hudební skladba (192 kbps)
│   └── Podcast.ts     — podcastová epizoda (64 kbps, progres)
├── data.ts            — katalog (instance tříd)
└── main.ts            — testovací výpis do konzole (polymorfismus)
```

## OOP pilíře v projektu

- **Abstrakce** — `abstract class AudioItem` se dvěma abstraktními metodami.
- **Zapouzdření** — `protected` atributy v rodičovské třídě, `private` atributy v potomcích, validace v setteru `progress`.
- **Dědičnost** — `Track extends AudioItem`, `Podcast extends AudioItem`, `super()` v konstruktorech.
- **Polymorfismus** — `AudioItem[]` s mixem typů, jednotné volání `getInfo()` a `calculateSize()`.

## Dokumentace

Část I. (teoretický rozbor) je v `docs/Audio_Library_Cast_I.docx`.
