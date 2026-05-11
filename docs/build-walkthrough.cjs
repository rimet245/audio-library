// Generátor dokumentu "Vysvětlení kódu řádek po řádku".
// Spouští se z kořene projektu: node docs/build-walkthrough.js

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun,
  Footer, AlignmentType, LevelFormat, PageNumber, PageBreak,
  HeadingLevel, ShadingType,
} = require('docx');

const FONT = 'Arial';
const MONO = 'Consolas';
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;

// ---------------- helpers ----------------
const text = (s, opts = {}) =>
  new TextRun({ text: s, font: FONT, size: 22, ...opts });

const p = (s, opts = {}) =>
  new Paragraph({
    spacing: { after: 140, line: 320 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
    children: [text(s, opts.run || {})],
  });

const h = (s, level) =>
  new Paragraph({
    heading: level,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text: s, font: FONT, bold: true })],
  });

const blank = () => new Paragraph({ children: [new TextRun('')] });

const codeLine = (s) =>
  new Paragraph({
    spacing: { after: 0, line: 260 },
    shading: { type: ShadingType.CLEAR, fill: 'F4F4F4' },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: s || ' ', font: MONO, size: 18 })],
  });

const codeBlock = (code) => code.split('\n').map(codeLine);

// Explanation block — "Řádek N — ..." (bold) followed by a paragraph
const explain = (lineLabel, body) => {
  const parts = [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: lineLabel, bold: true, font: FONT, size: 22 })],
    }),
  ];
  // body can be a string or array of strings (one per paragraph)
  const bodies = Array.isArray(body) ? body : [body];
  bodies.forEach((b) => {
    parts.push(
      new Paragraph({
        spacing: { after: 100, line: 300 },
        alignment: AlignmentType.JUSTIFIED,
        children: [text(b)],
      })
    );
  });
  return parts;
};

// Inline code rendering using monospace TextRun inside a paragraph
const inline = (chunks) => {
  // chunks: array of { t, mono?, bold?, italic? } or plain strings
  const runs = chunks.map((c) => {
    if (typeof c === 'string') return text(c);
    return new TextRun({
      text: c.t,
      font: c.mono ? MONO : FONT,
      size: c.mono ? 20 : 22,
      bold: c.bold || false,
      italics: c.italic || false,
    });
  });
  return new Paragraph({
    spacing: { after: 100, line: 300 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs,
  });
};

const explainInline = (lineLabel, chunkArrays) => {
  const parts = [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: lineLabel, bold: true, font: FONT, size: 22 })],
    }),
  ];
  chunkArrays.forEach((chunks) => parts.push(inline(chunks)));
  return parts;
};

// ============ TITLE ============
const titlePage = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 240 },
    children: [new TextRun({ text: 'VOŠ, SPŠ a JŠ Kutná Hora', font: FONT, size: 28, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
    children: [new TextRun({ text: 'PRG — IT2A', font: FONT, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 120 },
    children: [new TextRun({ text: 'Audio Library', font: FONT, size: 40, bold: true, color: '2E5C8A' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'Vysvětlení kódu řádek po řádku', font: FONT, size: 28, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 80 },
    children: [new TextRun({ text: 'Autor: Richard Metzner', font: FONT, size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'Třída: IT2A', font: FONT, size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'Školní rok: 2025 / 2026', font: FONT, size: 22 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ INTRO ============
const intro = [
  h('Úvod', HeadingLevel.HEADING_1),
  p(
    'Tento dokument provází kódem projektu Audio Library řádek po řádku. ' +
    'U každého souboru je nejprve uveden kompletní zdrojový kód, následuje rozbor — co konkrétní řádek dělá ' +
    'a proč je tam právě takový. Smyslem je vybavit autora pro obhajobu projektu, aby u každého řádku ' +
    'dokázal vysvětlit jeho funkci a důvod, proč nebyl napsán jinak.'
  ),
  p(
    'Projekt obsahuje pět TypeScriptových souborů. Tři tvoří hierarchii tříd (jeden abstraktní rodič, dva potomci), ' +
    'jeden je datový katalog a poslední slouží jako vstupní bod testovaného polymorfního výpisu do konzole. ' +
    'Vedle TypeScriptu je v repozitáři ještě jeden HTML soubor, který v prohlížeči spustí přeloženou JavaScriptovou ' +
    'verzi.'
  ),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ FILE 1: AudioItem.ts ============
const audioItemCode = `import { AudioItem } from "./AudioItem.js";  // — pouze v Track.ts a Podcast.ts

export abstract class AudioItem {
  constructor(
    protected title: string,
    protected author: string,
    protected duration: number,
  ) {}

  formatDuration(): string {
    const m = Math.floor(this.duration / 60);
    const s = this.duration % 60;
    return \`\${m}:\${s.toString().padStart(2, "0")}\`;
  }

  abstract getInfo(): string;
  abstract calculateSize(): number;
}`;

const fileAudioItem = [
  h('1. src/models/AudioItem.ts', HeadingLevel.HEADING_1),
  p(
    'Abstraktní bázová třída. Drží společné atributy všech audio položek (název, autor, délka) a definuje kontrakt, ' +
    'který musí každý potomek naplnit — dvě abstraktní metody getInfo() a calculateSize(). Jednu metodu si všichni ' +
    'potomci sdílejí: formatDuration(), která je pro každý audio obsah stejná.'
  ),
  h('Zdrojový kód', HeadingLevel.HEADING_2),
  ...codeBlock(audioItemCode),
  h('Řádek po řádku', HeadingLevel.HEADING_2),

  ...explainInline('Řádky 1–11 — JSDoc komentář nad třídou', [[
    'Komentář ohraničený /** ... */ je tzv. ',
    { t: 'JSDoc', italic: true },
    '. Když nad třídu najedu v editoru myší, IDE mi tento text zobrazí jako nápovědu. Slouží jako rychlá dokumentace pro budoucího čtenáře (i pro mě za půl roku). Když ho smažu, kód poběží stejně, ale ztratím přehled o tom, co která třída dělá.',
  ]]),

  ...explainInline('Řádek 12 — export abstract class AudioItem {', [
    [
      { t: 'export', mono: true },
      ' znamená, že třídu je možné importovat z jiných souborů (Track.ts, Podcast.ts, data.ts ji potřebují). Kdybych ',
      { t: 'export', mono: true },
      ' vynechal, třída by zůstala viditelná jen uvnitř tohoto souboru a kompilátor by jinde hlásil chybu.',
    ],
    [
      { t: 'abstract', mono: true },
      ' je klíčové slovo pro abstraktní třídu — z té nelze přímo vytvořit instanci. Když bych napsal ',
      { t: 'new AudioItem(...)', mono: true },
      ', kompilátor mě zastaví. Třída slouží jen jako šablona pro potomky. To je formální zachycení abstrakce: „audio obsah" sám o sobě neexistuje, vždy musí být něčím konkrétním (skladbou nebo podcastem).',
    ],
  ]),

  ...explainInline('Řádky 13–17 — Konstruktor s "parameter properties"', [
    [
      'Klasický TypeScript by vyžadoval třikrát napsat každý atribut — jednou jako pole třídy, jednou jako parametr konstruktoru a jednou v přiřazení. TypeScript ale nabízí zkratku: pokud u parametru konstruktoru napíšu modifikátor přístupu (',
      { t: 'protected', mono: true },
      ', ',
      { t: 'private', mono: true },
      ' nebo ',
      { t: 'public', mono: true },
      '), kompilátor automaticky vytvoří odpovídající atribut a přiřadí mu hodnotu z parametru. Tělo konstruktoru je tedy prázdné — ',
      { t: '{}', mono: true },
      '.',
    ],
    [
      'Modifikátor ',
      { t: 'protected', mono: true },
      ' znamená, že atribut je dostupný uvnitř této třídy A v jejích potomcích (Track, Podcast), ale ne z vnějšího kódu. Kdybych použil ',
      { t: 'public', mono: true },
      ', kdokoli zvenčí by mohl atribut měnit. Kdybych použil ',
      { t: 'private', mono: true },
      ', potomci by k němu nemohli.',
    ],
  ]),

  ...explain('Řádek 19 — formatDuration(): string {',
    'Deklarace veřejné metody (chybí modifikátor přístupu, takže se uplatní výchozí public). Návratový typ : string říká kompilátoru, že metoda musí vracet řetězec. Pokud bych omylem vrátil číslo nebo nic, kompilátor zahlásí chybu — TypeScript chytá tuhle třídu chyb už při překladu, ne až za běhu.'
  ),

  ...explainInline('Řádky 20–22 — Výpočet minut a sekund', [
    [
      { t: 'Math.floor(this.duration / 60)', mono: true },
      ' vrací celé minuty — funkce ',
      { t: 'floor', mono: true },
      ' zaokrouhluje dolů, takže z 354 sekund dostanu 5 minut (ne 5.9).',
    ],
    [
      { t: 'this.duration % 60', mono: true },
      ' je zbytek po dělení 60 — počet sekund po odečtení celých minut. Z 354 sekund dostanu 54.',
    ],
    [
      'Návratový řádek používá template literal (backticky ', { t: '`...`', mono: true }, '), který umožňuje vložit hodnoty proměnných pomocí ',
      { t: '${...}', mono: true },
      '. Volání ',
      { t: 'padStart(2, "0")', mono: true },
      ' doplní nulu zleva, pokud má řetězec méně než 2 znaky — díky tomu vidím ',
      { t: '"3:05"', mono: true },
      ' místo ',
      { t: '"3:5"', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádek 27 — abstract getInfo(): string;', [
    [
      'Abstraktní metoda — nemá tělo, jen hlavičku zakončenou středníkem. To kompilátoru říká: každý potomek MUSÍ tuto metodu implementovat, jinak ho odmítne přeložit. Tady je jádro principu „abstrakce v kontraktu": rodič nediktuje, JAK má potomek metodu napsat, jen že ji mít musí. Track ji napíše po svém (přidá žánr), Podcast taky po svém (přidá procenta progresu).',
    ],
  ]),

  ...explainInline('Řádek 30 — abstract calculateSize(): number;', [
    [
      'Druhá abstraktní metoda. Vrací číslo (velikost v MB). U Tracku se počítá z bitrate 192 kbps, u Podcastu z 64 kbps — stejné jméno metody, jiné chování. Tady později využije polymorfismus: ',
      { t: 'main.ts', mono: true },
      ' projde pole ',
      { t: 'AudioItem[]', mono: true },
      ' a u každé položky zavolá ',
      { t: 'calculateSize()', mono: true },
      ', aniž by zkoumal typ.',
    ],
  ]),

  ...explain('Řádek 31 — }',
    'Uzavření těla třídy. Bez něj by kompilátor hlásil syntaktickou chybu.'
  ),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ FILE 2: Track.ts ============
const trackCode = `import { AudioItem } from "./AudioItem.js";

export class Track extends AudioItem {
  constructor(
    title: string,
    author: string,
    duration: number,
    private genre: string,
  ) {
    super(title, author, duration);
  }

  getInfo(): string {
    return \`[Track] \${this.title} — \${this.author} (\${this.genre})\`;
  }

  calculateSize(): number {
    return (this.duration * 192) / 8 / 1024;
  }
}`;

const fileTrack = [
  h('2. src/models/Track.ts', HeadingLevel.HEADING_1),
  p(
    'Konkrétní potomek pro hudební skladbu. Dědí všechno z AudioItem a přidává si žánr. ' +
    'Implementuje obě abstraktní metody — getInfo() s formátem pro skladbu a calculateSize() ' +
    'podle bitrate 192 kbps (standardní kvalita hudebních nahrávek).'
  ),
  h('Zdrojový kód', HeadingLevel.HEADING_2),
  ...codeBlock(trackCode),
  h('Řádek po řádku', HeadingLevel.HEADING_2),

  ...explainInline('Řádek 1 — import { AudioItem } from "./AudioItem.js";', [
    [
      'Import bázové třídy — bez něj bych nemohl použít ',
      { t: 'extends AudioItem', mono: true },
      '. Cesta ',
      { t: '"./AudioItem.js"', mono: true },
      ' je vědomě zakončená příponou ',
      { t: '.js', mono: true },
      ' (i když soubor v TS je ',
      { t: '.ts', mono: true },
      ')! Důvod: po přeložení do JavaScriptu zůstane import přesně tak, jak jsem ho napsal, a prohlížeč pak hledá ',
      { t: 'AudioItem.js', mono: true },
      ', protože ESM moduly v prohlížeči vyžadují explicitní příponu. TypeScript tuhle „budoucí" cestu akceptuje a při překladu si AudioItem.ts najde sám.',
    ],
  ]),

  ...explainInline('Řádek 3 — export class Track extends AudioItem {', [
    [
      { t: 'export', mono: true },
      ' opět umožňuje import jinde (data.ts). ',
      { t: 'extends AudioItem', mono: true },
      ' znamená dědičnost — Track přebírá všechny atributy a metody z AudioItem. Není označená jako ',
      { t: 'abstract', mono: true },
      ', takže z ní lze vytvořit konkrétní instanci pomocí ',
      { t: 'new Track(...)', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádky 4–9 — Konstruktor', [
    [
      'První tři parametry (',
      { t: 'title, author, duration', mono: true },
      ') jdou bez modifikátoru — nestávají se z nich atributy Tracku, jen se pošlou výš do rodiče. Čtvrtý parametr ',
      { t: 'private genre: string', mono: true },
      ' používá tu samou zkratku jako u AudioItem — TypeScript automaticky vytvoří soukromý atribut ',
      { t: 'genre', mono: true },
      '.',
    ],
    [
      'Modifikátor ',
      { t: 'private', mono: true },
      ' znamená přísnější ochranu než ',
      { t: 'protected', mono: true },
      ' — k atributu nemají přístup ani případní potomci Tracku (kdyby nějací byli). Pro tuhle aplikaci to dává smysl: žánr je interní detail Tracku, nikoho jiného nezajímá.',
    ],
    [
      'Volání ',
      { t: 'super(title, author, duration)', mono: true },
      ' v těle konstruktoru spustí konstruktor rodiče (AudioItem). Tím se naplní zděděné atributy ',
      { t: 'title', mono: true },
      ', ',
      { t: 'author', mono: true },
      ' a ',
      { t: 'duration', mono: true },
      '. Bez ',
      { t: 'super()', mono: true },
      ' by kompilátor hlásil chybu — v potomcích třídy je volání rodičovského konstruktoru povinné.',
    ],
  ]),

  ...explainInline('Řádek 13 — return `[Track] ${this.title} — ${this.author} (${this.genre})`;', [
    [
      'Implementace abstraktní metody getInfo(). Template literal skládá výstupní řetězec ze čtyř částí: literálního ',
      { t: '"[Track] "', mono: true },
      ', názvu, autora a žánru. Hranaté závorky ',
      { t: '[Track]', mono: true },
      ' slouží jako rychlý vizuální typový štítek — ve výpisu je hned vidět, že jde o skladbu, ne podcast.',
    ],
    [
      'Atributy ',
      { t: 'this.title', mono: true },
      ' a ',
      { t: 'this.author', mono: true },
      ' jsou ',
      { t: 'protected', mono: true },
      ' v AudioItem — Track k nim má přístup, protože je jejím potomkem. ',
      { t: 'this.genre', mono: true },
      ' je vlastní soukromý atribut Tracku.',
    ],
  ]),

  ...explainInline('Řádek 17 — return (this.duration * 192) / 8 / 1024;', [
    [
      'Výpočet velikosti souboru v megabajtech. Vzorec je: (sekundy × kbps) / 8 / 1024.',
    ],
    [
      'Vysvětlení: bitrate 192 kbps znamená 192 kilobitů za sekundu. Za ',
      { t: 'duration', mono: true },
      ' sekund vznikne ',
      { t: 'duration × 192', mono: true },
      ' kilobitů. Dělení 8 převede na kilobajty (1 bajt = 8 bitů), dělení 1024 z kilobajtů na megabajty. Hodnota 192 je v kódu napevno — pro uživatele aplikace by detail bitrate byl zbytečný šum.',
    ],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ FILE 3: Podcast.ts ============
const podcastCode = `import { AudioItem } from "./AudioItem.js";

export class Podcast extends AudioItem {
  private _progress = 0;

  constructor(
    title: string,
    author: string,
    duration: number,
    progress: number,
  ) {
    super(title, author, duration);
    this.progress = progress; // jde přes setter — validace se uplatní
  }

  get progress(): number {
    return this._progress;
  }

  set progress(value: number) {
    this._progress = Math.max(0, Math.min(1, value));
  }

  getInfo(): string {
    return \`[Podcast] \${this.title} — \${this.author} (\${Math.round(this._progress * 100)} %)\`;
  }

  calculateSize(): number {
    return (this.duration * 64) / 8 / 1024;
  }
}`;

const filePodcast = [
  h('3. src/models/Podcast.ts', HeadingLevel.HEADING_1),
  p(
    'Druhý konkrétní potomek — podcastová epizoda. Specifický atribut je _progress (0 = začátek, 1 = doposlechnuto). ' +
    'Atribut je chráněný setterem, který ořezává hodnoty mimo rozsah 0–1. Velikost se počítá z bitrate 64 kbps — ' +
    'mluvené slovo se ukládá v nižší kvalitě než hudba, protože ucho v něm slyší méně detailů.'
  ),
  h('Zdrojový kód', HeadingLevel.HEADING_2),
  ...codeBlock(podcastCode),
  h('Řádek po řádku', HeadingLevel.HEADING_2),

  ...explainInline('Řádek 4 — private _progress = 0;', [
    [
      'Tady NEPOUŽÍVÁM parameter property, protože atribut potřebuje setter s validací. Místo toho deklaruji atribut tradičně — modifikátor ',
      { t: 'private', mono: true },
      ', podtržítko v názvu (',
      { t: '_progress', mono: true },
      ') a výchozí hodnota ',
      { t: '0', mono: true },
      '.',
    ],
    [
      'Podtržítko v názvu je konvence: signalizuje, že jde o „vnitřní" atribut, ke kterému se má přistupovat přes getter/setter ',
      { t: 'progress', mono: true },
      ' (bez podtržítka). Pokud by někdo četl kód a viděl ',
      { t: 'this._progress', mono: true },
      ', hned ví, že sahá pod kapotu — měl by raději použít ',
      { t: 'this.progress', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádky 6–14 — Konstruktor', [
    [
      'První tři parametry předávám rodiči přes ',
      { t: 'super()', mono: true },
      ', stejně jako u Tracku. Čtvrtý parametr ',
      { t: 'progress: number', mono: true },
      ' tentokrát NEMÁ modifikátor — nechci, aby z něj vznikl automatický atribut. Atribut ',
      { t: '_progress', mono: true },
      ' už mám zvlášť deklarovaný (řádek 4).',
    ],
    [
      'Klíčový řádek je ',
      { t: 'this.progress = progress;', mono: true },
      ' — vypadá to jako přiřazení do atributu, ale ve skutečnosti jde o volání setteru ',
      { t: 'progress', mono: true },
      ' definovaného o pár řádků níž. Setter pak validuje hodnotu a teprve poté zapíše do ',
      { t: '_progress', mono: true },
      '. Tím je validace povinná i z konstruktoru — nedá se obejít.',
    ],
  ]),

  ...explainInline('Řádky 16–18 — Getter progress', [
    [
      'Veřejný getter, který vrací aktuální hodnotu ',
      { t: '_progress', mono: true },
      '. Z vnějšku se volá jako obyčejný atribut: ',
      { t: 'podcast.progress', mono: true },
      ' (bez závorek), ale ve skutečnosti se spouští tahle metoda.',
    ],
    [
      'Smysl: vnější kód nepotřebuje vědět, že atribut se vnitřně jmenuje ',
      { t: '_progress', mono: true },
      ', ani jak je validovaný. Vidí jen jednu jednoduchou vlastnost ',
      { t: 'progress', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádky 20–22 — Setter progress (zapouzdření v akci)', [
    [
      'Tady se odehrává zapouzdření v praxi. Setter přijme hodnotu a propustí ji přes dvojí kontrolu: ',
      { t: 'Math.max(0, ...)', mono: true },
      ' zajistí, že hodnota není menší než 0, a ',
      { t: 'Math.min(1, ...)', mono: true },
      ' zajistí, že není větší než 1. Vnořením do sebe (',
      { t: 'Math.max(0, Math.min(1, value))', mono: true },
      ') dostanu výsledek vždy v rozsahu 0–1.',
    ],
    [
      'Když uživatel napíše ',
      { t: 'podcast.progress = 1.5', mono: true },
      ', setter ho tiše ořízne na 1. Když napíše ',
      { t: '-0.3', mono: true },
      ', přepíše to na 0. Aplikace tak nemá kde rozbít — neplatný stav se prostě nedostane dovnitř objektu. Bez setteru bych se musel spoléhat, že se nikdo nesplete při psaní kódu.',
    ],
  ]),

  ...explainInline('Řádek 25 — getInfo() podcastu', [
    [
      { t: 'Math.round(this._progress * 100)', mono: true },
      ' převede progres 0–1 na procenta 0–100. ',
      { t: 'Math.round', mono: true },
      ' zaokrouhlí na nejbližší celé číslo — z 0.35 dostanu 35.',
    ],
    [
      'Stejné jméno metody jako u Tracku (',
      { t: 'getInfo()', mono: true },
      '), úplně jiné chování. Tohle je polymorfismus na úrovni metody.',
    ],
  ]),

  ...explainInline('Řádek 29 — calculateSize() podcastu', [
    [
      'Stejný vzorec jako u Tracku, jen s bitrate 64 místo 192. Mluvené slovo se nahrává ve výrazně nižší kvalitě, protože v něm ucho vyšší detaily nevnímá. Důsledkem je, že hodinový podcast (3600 s) zabere zhruba 28 MB, zatímco hodinová hudba v 192 kbps zhruba 84 MB.',
    ],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ FILE 4: data.ts ============
const dataCode = `import { AudioItem } from "./models/AudioItem.js";
import { Track } from "./models/Track.js";
import { Podcast } from "./models/Podcast.js";

export const catalog: AudioItem[] = [
  new Track("Bohemian Rhapsody", "Queen", 354, "rock"),
  new Track("Imagine", "John Lennon", 183, "pop"),
  new Track("Symfonie č. 9", "Beethoven", 4200, "klasika"),
  new Podcast("Vinohradská 12: Volby v USA", "Český rozhlas", 1800, 0.35),
  new Podcast("Lex Fridman: AI Safety", "Lex Fridman", 7200, 0),
];`;

const fileData = [
  h('4. src/data.ts', HeadingLevel.HEADING_1),
  p(
    'Katalog — datová vrstva oddělená od logiky. Sem se doplňují nové položky, aniž by se sahalo do tříd ' +
    'nebo do hlavního souboru. Pole obsahuje připravené instance Tracků a Podcastů.'
  ),
  h('Zdrojový kód', HeadingLevel.HEADING_2),
  ...codeBlock(dataCode),
  h('Řádek po řádku', HeadingLevel.HEADING_2),

  ...explainInline('Řádky 1–3 — Importy', [
    [
      'Importuju všechny tři třídy. ',
      { t: 'AudioItem', mono: true },
      ' potřebuju jako typ pole (',
      { t: 'AudioItem[]', mono: true },
      '), ',
      { t: 'Track', mono: true },
      ' a ',
      { t: 'Podcast', mono: true },
      ' potřebuju proto, abych je mohl vytvořit přes ',
      { t: 'new', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádek 5 — export const catalog: AudioItem[] = [', [
    [
      { t: 'const', mono: true },
      ' znamená, že proměnnou ',
      { t: 'catalog', mono: true },
      ' nepřepíšu jiným polem (samotné prvky pole ale měnit lze — to ',
      { t: 'const', mono: true },
      ' v JavaScriptu neomezuje).',
    ],
    [
      'Anotace typu ',
      { t: ': AudioItem[]', mono: true },
      ' je klíčová. Říká kompilátoru: tohle pole obsahuje audio položky, ale konkrétní typ (Track nebo Podcast) tě nemá zajímat. Když pak v main.ts iteruju přes toto pole, mám záruku, že každá položka má metody ',
      { t: 'getInfo()', mono: true },
      ' a ',
      { t: 'calculateSize()', mono: true },
      ' — to je celé jádro polymorfismu.',
    ],
  ]),

  ...explainInline('Řádky 6–10 — Vytvoření instancí', [
    [
      'Pět zavolání ',
      { t: 'new', mono: true },
      ' s konstruktory tříd. Pořadí parametrů odpovídá konstruktorům: Track má (title, author, duration, genre), Podcast má (title, author, duration, progress). Délka je v sekundách — 354 s = 5:54, 4200 s = 1:10:00 (Beethovenova devátá symfonie je dlouhá).',
    ],
    [
      'Podcast „Vinohradská 12" má progres 0.35 — uživatel poslechl 35 %. „Lex Fridman" má progres 0 — ještě se nezačal poslouchat. Hodnoty se v main.ts projeví jako procenta ve výpisu.',
    ],
    [
      'Toto je místo, kam se v reálné aplikaci přidávají nové položky. Pokud bych zítra přidal novou skladbu, doplním ji sem — a zbytek kódu (main.ts, třídy) zůstává netknutý. Tomu se říká oddělení dat od logiky.',
    ],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ FILE 5: main.ts ============
const mainCode = `import { catalog } from "./data.js";

catalog.forEach((item) => {
  console.log(
    \`\${item.getInfo()} | \${item.formatDuration()} | \${item.calculateSize().toFixed(2)} MB\`,
  );
});`;

const fileMain = [
  h('5. src/main.ts', HeadingLevel.HEADING_1),
  p(
    'Vstupní bod aplikace. Tady se odehrává hlavní demonstrace polymorfismu — jeden cyklus, který funguje stejně ' +
    'pro Track i Podcast, aniž by rozlišoval typ. Výstup míří do konzole prohlížeče (F12).'
  ),
  h('Zdrojový kód', HeadingLevel.HEADING_2),
  ...codeBlock(mainCode),
  h('Řádek po řádku', HeadingLevel.HEADING_2),

  ...explainInline('Řádek 1 — import { catalog } from "./data.js";', [
    [
      'Načtu připravený katalog jako pole ',
      { t: 'AudioItem[]', mono: true },
      '. Z mainu nepotřebuju vědět nic o jednotlivých třídách — stačí mi vědět, že každý prvek je ',
      { t: 'AudioItem', mono: true },
      ' a má metody ',
      { t: 'getInfo()', mono: true },
      ', ',
      { t: 'formatDuration()', mono: true },
      ' a ',
      { t: 'calculateSize()', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádek 3 — catalog.forEach((item) => {', [
    [
      'Klasická iterace přes pole. Pro každou položku se zavolá callback funkce s parametrem ',
      { t: 'item', mono: true },
      '. TypeScript ví, že ',
      { t: 'item', mono: true },
      ' má typ ',
      { t: 'AudioItem', mono: true },
      ' — tedy mu mohu volat jen metody, které AudioItem definuje. Specifika potomků (',
      { t: 'genre', mono: true },
      ' u Tracku, ',
      { t: 'progress', mono: true },
      ' u Podcastu) tady nejsou viditelná — a to je úmysl. Kód se chová ke všem položkám stejně.',
    ],
  ]),

  ...explainInline('Řádek 4 — console.log(', [
    [
      'Vypíše výsledek do konzole prohlížeče (případně do terminálu, pokud kód běží přes Node). Pro studenta je to nejjednodušší způsob, jak ověřit, že kód funguje, bez nutnosti vyrábět HTML.',
    ],
  ]),

  ...explainInline('Řádek 5 — `${item.getInfo()} | ${item.formatDuration()} | ${item.calculateSize().toFixed(2)} MB`', [
    [
      'Klíčový řádek celého projektu. Tři volání metod, žádné ',
      { t: 'if', mono: true },
      ', žádné ',
      { t: 'instanceof', mono: true },
      ', žádné rozlišování typu. Přesto Track dostane výpis se žánrem, Podcast s procenty progresu. To je polymorfismus — stejné volání, různé chování podle skutečného typu objektu.',
    ],
    [
      { t: 'item.getInfo()', mono: true },
      ' — Track vrátí ',
      { t: '"[Track] název — autor (žánr)"', mono: true },
      ', Podcast vrátí ',
      { t: '"[Podcast] název — autor (XX %)"', mono: true },
      '. JavaScript za běhu pozná, jaká je skutečná třída objektu, a zavolá její konkrétní implementaci.',
    ],
    [
      { t: 'item.formatDuration()', mono: true },
      ' — tahle metoda není přepsaná u žádného potomka. Funguje stejně pro všechny, protože je definovaná v rodiči (AudioItem). Sdílená logika napsaná jen jednou.',
    ],
    [
      { t: 'item.calculateSize().toFixed(2)', mono: true },
      ' — opět polymorfismus. Track počítá 192 kbps, Podcast 64 kbps. ',
      { t: '.toFixed(2)', mono: true },
      ' zaokrouhlí výsledek na 2 desetinná místa a vrátí ho jako řetězec — ',
      { t: '"8.30"', mono: true },
      ' místo ',
      { t: '"8.296875"', mono: true },
      '.',
    ],
  ]),

  ...explainInline('Řádek 7 — });', [
    [
      'Zavře callback i volání ',
      { t: 'forEach', mono: true },
      '. Středník na konci uzavírá příkaz.',
    ],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ ANCILLARY FILES ============
const ancillary = [
  h('6. Pomocné soubory', HeadingLevel.HEADING_1),

  h('6.1 index.html', HeadingLevel.HEADING_2),
  p(
    'HTML stránka, která v prohlížeči spouští přeloženou JavaScriptovou aplikaci. Sama o sobě nedělá nic ' +
    'viditelného — výstup míří do konzole, kterou si uživatel otevře klávesou F12.'
  ),
  ...codeBlock(`<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <title>Audio Library</title>
  </head>
  <body>
    <p>Otevři konzoli (F12 → Console).</p>
    <script type="module" src="./dist/main.js"></script>
  </body>
</html>`),

  ...explainInline('Klíčový řádek — <script type="module" src="./dist/main.js">', [
    [
      { t: 'type="module"', mono: true },
      ' říká prohlížeči, že JavaScript je v podobě ES modulů (',
      { t: 'import', mono: true },
      ' / ',
      { t: 'export', mono: true },
      '), ne klasický globální skript. Bez tohoto atributu by prohlížeč ',
      { t: 'import', mono: true },
      ' v ',
      { t: 'main.js', mono: true },
      ' nepřijal a zahlásil syntaktickou chybu.',
    ],
    [
      'Cesta ',
      { t: './dist/main.js', mono: true },
      ' odkazuje na přeloženou JavaScriptovou verzi, ne na ',
      { t: '.ts', mono: true },
      ' — prohlížeč TypeScriptu nerozumí. Vždy potřebuje výstup z ',
      { t: 'tsc', mono: true },
      '.',
    ],
  ]),

  h('6.2 tsconfig.json', HeadingLevel.HEADING_2),
  p('Konfigurace TypeScriptového kompilátoru. Říká, co a kam má překládat a v jakém režimu.'),
  ...codeBlock(`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    ...
  },
  "include": ["src/**/*.ts"]
}`),

  ...explainInline('Důležité volby', [
    [
      { t: '"target": "ES2020"', mono: true },
      ' — výstupní JavaScript bude ve verzi ES2020 (moderní syntaxe, podporovaná všemi aktuálními prohlížeči).',
    ],
    [
      { t: '"outDir": "./dist"', mono: true },
      ' a ',
      { t: '"rootDir": "./src"', mono: true },
      ' — řekne kompilátoru: vezmi všechno z ',
      { t: 'src/', mono: true },
      ' a přelož to do ',
      { t: 'dist/', mono: true },
      ' se zachovanou strukturou složek.',
    ],
    [
      { t: '"strict": true', mono: true },
      ' — zapne všechny přísné kontroly typů. Bez nich by TypeScript ledacos přehlédl (například implicitní ',
      { t: 'any', mono: true },
      '). S ',
      { t: 'strict', mono: true },
      ' chytám chyby už při překladu, ne za běhu.',
    ],
  ]),

  h('6.3 package.json', HeadingLevel.HEADING_2),
  p('Manifest projektu. Definuje název, závislosti a spouštěcí skripty.'),
  ...codeBlock(`{
  "name": "audio-library",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "serve": "npx http-server -p 5173 -c-1"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}`),

  ...explainInline('Skripty', [
    [
      { t: 'npm run build', mono: true },
      ' — spustí ',
      { t: 'tsc', mono: true },
      ', což přeloží ',
      { t: 'src/*.ts', mono: true },
      ' do ',
      { t: 'dist/*.js', mono: true },
      '.',
    ],
    [
      { t: 'npm run watch', mono: true },
      ' — kompilátor zůstane spuštěný a při každé změně ',
      { t: '.ts', mono: true },
      ' souboru automaticky přepíše ',
      { t: '.js', mono: true },
      '. Pohodlné při vývoji.',
    ],
    [
      { t: 'npm run serve', mono: true },
      ' — spustí jednoduchý HTTP server na portu 5173, aby prohlížeč mohl ESM moduly načíst (přímé otevření ',
      { t: 'index.html', mono: true },
      ' přes ',
      { t: 'file://', mono: true },
      ' to z bezpečnostních důvodů blokuje).',
    ],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ POLYMORPHISM SUMMARY ============
const polymorphismSummary = [
  h('7. Kde přesně se v kódu projevuje polymorfismus', HeadingLevel.HEADING_1),
  p(
    'Polymorfismus je princip, který se nejhůř vysvětluje, a zároveň je v tomhle projektu nejvíc vidět. Tady je ' +
    'jeho úplný „audit" — místa v kódu, kde funguje, a důvod, proč funguje.'
  ),

  h('Místo č. 1 — Typování pole', HeadingLevel.HEADING_2),
  ...codeBlock(`export const catalog: AudioItem[] = [
  new Track(...),
  new Track(...),
  new Podcast(...),
  ...
];`),
  p(
    'Pole je deklarované jako AudioItem[], ne Track[] nebo Podcast[]. To umožňuje, aby v něm byly obě varianty zároveň. ' +
    'Bez polymorfismu by se musela mít dvě oddělená pole a iterovat každé zvlášť.'
  ),

  h('Místo č. 2 — Iterace bez rozlišování typu', HeadingLevel.HEADING_2),
  ...codeBlock(`catalog.forEach((item) => {
  console.log(\`\${item.getInfo()} | \${item.formatDuration()} | \${item.calculateSize().toFixed(2)} MB\`);
});`),
  p(
    'V cyklu volám tři metody nad něčím, o čem TypeScript zná jen to, že je to AudioItem. Přesto Track odpoví ' +
    'po svém (192 kbps, formát se žánrem) a Podcast taky po svém (64 kbps, formát s procenty). JavaScript za běhu ' +
    'pozná skutečnou třídu objektu (mechanismus se jmenuje dynamic dispatch) a zavolá její vlastní implementaci.'
  ),

  h('Místo č. 3 — Přepsání abstraktních metod', HeadingLevel.HEADING_2),
  ...codeBlock(`// AudioItem.ts (rodič):
abstract getInfo(): string;
abstract calculateSize(): number;

// Track.ts (potomek):
getInfo(): string { return \`[Track] ...\`; }
calculateSize(): number { return (this.duration * 192) / 8 / 1024; }

// Podcast.ts (potomek):
getInfo(): string { return \`[Podcast] ...\`; }
calculateSize(): number { return (this.duration * 64) / 8 / 1024; }`),
  p(
    'Bázová třída deklaruje kontrakt (abstract metody), potomci ho každý naplňují vlastní implementací. Stejné jméno, ' +
    'stejná signatura, jiné chování. Když přidám třetí potomka (třeba Audiobook) a implementuju u něj ty samé dvě ' +
    'metody, výpis v main.ts pro něj automaticky zafunguje — beze změny jediného řádku v main.ts.'
  ),
];

// ============ DEFENSE Q&A ============
const defenseQA = [
  h('8. Otázky, na které musím umět odpovědět', HeadingLevel.HEADING_1),
  p(
    'Toto jsou typické otázky, které se učitel může zeptat při obhajobě. Odpovědi vycházejí přímo z kódu projektu.'
  ),

  h('Proč je AudioItem abstraktní?', HeadingLevel.HEADING_2),
  p(
    'Protože „audio obsah" sám o sobě neexistuje — vždycky je to buď konkrétní skladba, nebo konkrétní podcast. ' +
    'Abstraktní třída tohle zachycuje formálně: kompilátor nedovolí vytvořit instanci AudioItem napřímo. Navíc ' +
    'vyžaduje od potomků implementaci dvou metod (getInfo, calculateSize), což garantuje, že každý potomek ' +
    'bude umět odpovědět na základní otázky o sobě.'
  ),

  h('Proč jsou atributy protected a private, ne public?', HeadingLevel.HEADING_2),
  p(
    'Zapouzdření — chci, aby si objekt sám hlídal vlastní integritu. Kdyby byl _progress public, kdokoli zvenčí ' +
    'by ho mohl nastavit na 1.5 nebo -2 a aplikace by se chovala podivně. Setter to nepustí. Atributy v ' +
    'rodičovské třídě jsou protected, protože k nim potřebují potomci (Track čte this.title v getInfo). Atributy ' +
    'specifické pro potomka (genre v Tracku, _progress v Podcastu) jsou private, protože nikoho jiného nezajímají.'
  ),

  h('Co kdybych chtěl přidat třetí typ obsahu?', HeadingLevel.HEADING_2),
  p(
    'Vytvořím novou třídu, třeba Audiobook, která dědí od AudioItem (extends AudioItem). Implementuji v ní ' +
    'dvě abstraktní metody — getInfo() s formátem pro audioknihu, calculateSize() s vlastním vzorcem (třeba ' +
    'také 64 kbps jako Podcast). Pak ji importuju v data.ts a přidám pár instancí do pole catalog. main.ts ' +
    'i ostatní třídy zůstanou beze změny — to je škálovatelná architektura, hlavní výhoda OOP.'
  ),

  h('Proč mají importy příponu .js, když soubory jsou .ts?', HeadingLevel.HEADING_2),
  p(
    'Protože po překladu zůstane v JavaScriptu přesně to, co jsem napsal v TypeScriptu. Prohlížeč pracuje s ' +
    '.js soubory a ESM moduly v prohlížeči vyžadují explicitní příponu — bez ní se import nepodaří načíst. ' +
    'TypeScript je v tomto ohledu shovívavý: akceptuje import s příponou .js i když fyzický soubor je .ts, ' +
    'protože ví, že po překladu to bude správně.'
  ),

  h('K čemu je formatDuration v rodičovské třídě?', HeadingLevel.HEADING_2),
  p(
    'Demonstruje sdílenou logiku. Převod sekund na mm:ss je pro Track i Podcast úplně stejný — proč ho psát ' +
    'dvakrát? Když je v rodiči, potomci ho dědí a používají bez vlastní implementace. Když bych chtěl změnit ' +
    'formát (například přidat hodiny pro dlouhý obsah), upravím to na jednom místě.'
  ),

  h('Co dělá this.progress = progress v konstruktoru Podcastu?', HeadingLevel.HEADING_2),
  p(
    'Vypadá to jako přiřazení do atributu, ale ve skutečnosti volá setter progress (definovaný o pár řádků níž). ' +
    'Setter pak hodnotu validuje (ořezání do 0–1) a teprve poté zapíše do _progress. Kdybych napsal this._progress = progress, ' +
    'obešel bych validaci a podcast by mohl mít progres 1.5 — neplatný stav. Volání přes setter je pojistka.'
  ),
];

// ============ DOCUMENT ============
const doc = new Document({
  creator: 'Audio Library — Code Walkthrough',
  title: 'Audio Library — Vysvětlení kódu řádek po řádku',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: '2E5C8A' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: '2E5C8A' },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Audio Library — Code Walkthrough    |    Strana ', font: FONT, size: 18, color: '666666' }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: '666666' }),
                new TextRun({ text: ' / ', font: FONT, size: 18, color: '666666' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: '666666' }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...titlePage,
        ...intro,
        ...fileAudioItem,
        ...fileTrack,
        ...filePodcast,
        ...fileData,
        ...fileMain,
        ...ancillary,
        ...polymorphismSummary,
        ...defenseQA,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, 'Audio_Library_Code_Walkthrough.docx');
  fs.writeFileSync(out, buf);
  console.log('OK:', out, buf.length, 'bytes');
});
