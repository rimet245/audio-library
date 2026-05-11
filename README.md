# Audio Library

> 🇨🇿 Česká verze: [README.cs.md](./README.cs.md)

School project for the *Programming* course (2nd year, IT branch).
An interactive audio library built on TypeScript and the four pillars of object-oriented programming.

## Quick start

```bash
npm install
npm run build       # compiles src/*.ts → dist/*.js
npm run serve       # starts a local HTTP server on port 5173
```

Open <http://localhost:5173>, then press **F12 → Console** to see the polymorphic output.

Alternatively, run the compiled output directly through Node:

```bash
node dist/main.js
```

## Project structure

```
src/                       # TypeScript source
├── models/
│   ├── AudioItem.ts       # abstract base class
│   ├── Track.ts           # music track (192 kbps)
│   └── Podcast.ts         # podcast episode (64 kbps, progress)
├── data.ts                # catalog (instances of the classes)
└── main.ts                # console demo (polymorphism)

dist/                      # JavaScript output (committed for review)
├── models/
│   ├── AudioItem.js
│   ├── Track.js
│   └── Podcast.js
├── data.js
└── main.js
```

## OOP pillars in the code

- **Abstraction** — `abstract class AudioItem` with two abstract methods. You cannot instantiate `AudioItem` directly.
- **Encapsulation** — `protected` fields on the parent, `private` fields on the children. `_progress` is guarded by a setter that clamps the value to `0–1`.
- **Inheritance** — `class Track extends AudioItem`, `class Podcast extends AudioItem`, with `super()` calls in the constructors.
- **Polymorphism** — a single `AudioItem[]` holds a mix of `Track` and `Podcast` instances. The iteration in `main.ts` calls `getInfo()` and `calculateSize()` uniformly, without checking the runtime type.

## Documentation

Part I (theoretical analysis) is in [`docs/Audio_Library_Cast_I.docx`](./docs/Audio_Library_Cast_I.docx).
The UML class diagram is in [`docs/uml-diagram.png`](./docs/uml-diagram.png).

## License

MIT — see [LICENSE](./LICENSE).
