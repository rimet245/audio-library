# Audio Library

> 🇨🇿 Česká verze: [README.cs.md](./README.cs.md)

An interactive audio library built on TypeScript and the four pillars of object-oriented programming.

## Quick start

```bash
npm install
npm run build       # compiles src/*.ts → dist/*.js
npm run serve       # starts a local HTTP server on port 5173
```

Open <http://localhost:5173>. The interactive interface lets you add tracks and
podcasts through a form, adjust podcast progress with a live slider, remove
items, and filter by type — all totals recompute instantly, with no page reload.

## Project structure

```
index.html                 # page structure
styles.css                 # responsive layout (Grid + Flexbox)

src/                       # TypeScript source
├── models/
│   ├── AudioItem.ts       # abstract base class
│   ├── Track.ts           # music track (192 kbps)
│   └── Podcast.ts         # podcast episode (64 kbps, progress)
├── Library.ts             # collection wrapping AudioItem[] (totals, add/remove)
├── data.ts                # catalog (instances of the classes)
└── main.ts                # interactive UI (DOM rendering, polymorphism)

dist/                      # JavaScript output (committed for review)
├── models/
│   ├── AudioItem.js
│   ├── Track.js
│   └── Podcast.js
├── Library.js
├── data.js
└── main.js
```

## OOP pillars in the code

- **Abstraction** — `abstract class AudioItem` with two abstract methods. You cannot instantiate `AudioItem` directly.
- **Encapsulation** — `protected` fields on the parent, `private` fields on the children. `_progress` is guarded by a setter that clamps the value to `0–1`.
- **Inheritance** — `class Track extends AudioItem`, `class Podcast extends AudioItem`, with `super()` calls in the constructors.
- **Polymorphism** — a single `AudioItem[]` (wrapped by `Library`) holds a mix of `Track` and `Podcast` instances. Rendering and the totals call `getInfo()`, `formatDuration()` and `calculateSize()` uniformly, without checking the runtime type. The concrete type is only distinguished where the UI genuinely differs (the podcast progress slider).

## Documentation

The UML class diagram is in [`docs/uml-diagram.png`](./docs/uml-diagram.png).

The written documentation (Parts I–III) is submitted separately as PDF and is not part of
this repository (see `.gitignore`).

## License

MIT — see [LICENSE](./LICENSE).
