const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Footer, AlignmentType, LevelFormat, PageNumber, PageBreak,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
} = require('docx');

const FONT = 'Arial';
const MONO = 'Consolas';
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9026

const ROOT = path.join(__dirname, '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ------- helpers -------
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 160, line: 320 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
    children: [new TextRun({ text, font: FONT, size: 22, ...(opts.run || {}) })],
  });

const h = (text, level) =>
  new Paragraph({
    heading: level,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, font: FONT, bold: true })],
  });

const bullet = (text, runs) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: 300 },
    children: runs || [new TextRun({ text, font: FONT, size: 22 })],
  });

// jednořádkový "code" pro krátké úryvky (např. strom tříd)
const code = (text) =>
  new Paragraph({
    spacing: { after: 40, line: 280 },
    shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text, font: MONO, size: 20 })],
  });

const blank = () => new Paragraph({ children: [new TextRun('')] });

// celý zdrojový soubor jako šedý blok (tabulka 1×1, řádek po řádku)
const codeBlock = (source) => {
  const lines = source.replace(/\r/g, '').replace(/\t/g, '  ').split('\n');
  // odstraň případný poslední prázdný řádek
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  const paras = lines.map((line) =>
    new Paragraph({
      spacing: { after: 0, before: 0, line: 240 },
      children: [new TextRun({ text: line.length ? line : ' ', font: MONO, size: 16 })],
    })
  );
  const thin = { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9' };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            borders: { top: thin, bottom: thin, left: thin, right: thin },
            shading: { type: ShadingType.CLEAR, fill: 'F6F6F6' },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: paras,
          }),
        ],
      }),
    ],
  });
};

// obrázek na střed + popisek
const image = (file, w, hgt) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new ImageRun({
        type: 'png',
        data: fs.readFileSync(path.join(__dirname, file)),
        transformation: { width: w, height: hgt },
      }),
    ],
  });

const caption = (text) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text, font: FONT, size: 18, italics: true, color: '666666' })],
  });

// odstavec se zvýrazněným úvodem typu "Proč X? zbytek textu"
const why = (boldPart, rest) =>
  new Paragraph({
    spacing: { after: 160, line: 320 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: boldPart + ' ', font: FONT, size: 22, bold: true }),
      new TextRun({ text: rest, font: FONT, size: 22 }),
    ],
  });

// nadpis souboru ve výpisu kódu
const fileHeading = (name) =>
  new Paragraph({
    spacing: { before: 280, after: 120 },
    keepNext: true,
    children: [new TextRun({ text: name, font: MONO, size: 22, bold: true })],
  });

// ============ TITULNÍ STRANA ============
const C = (text, opts = {}) =>
  new Paragraph({ alignment: AlignmentType.CENTER, ...opts, children: [new TextRun({ text, font: FONT, ...(opts.run || {}) })] });

const titlePage = [
  C('VOŠ, SPŠ a JŠ Kutná Hora', { spacing: { before: 2200, after: 80 }, run: { size: 28, bold: true } }),
  C('Programování — IT2A', { spacing: { after: 1100 }, run: { size: 24 } }),
  C('Ročníkový projekt — Část III.', { spacing: { before: 400, after: 100 }, run: { size: 32, bold: true, color: '1D1D1F' } }),
  C('UI, responzivita a finální dokumentace', { spacing: { after: 200 }, run: { size: 26, italics: true } }),
  C('Audio Library', { spacing: { before: 1000, after: 80 }, run: { size: 46, bold: true } }),
  C('Interaktivní webová aplikace pro správu hudebního playlistu', { spacing: { after: 1600 }, run: { size: 24, italics: true } }),
  C('Autor:  Richard Metzner', { spacing: { after: 100 }, run: { size: 24 } }),
  C('Třída:  IT2A', { spacing: { after: 100 }, run: { size: 24 } }),
  C('Předmět:  Programování', { spacing: { after: 100 }, run: { size: 24 } }),
  C('Technologie:  TypeScript, HTML, CSS', { spacing: { after: 100 }, run: { size: 24 } }),
  C('Školní rok 2025 / 2026', { spacing: { before: 200 }, run: { size: 24 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ OBSAH ============
const tocPage = [
  h('Obsah', HeadingLevel.HEADING_1),
  new TableOfContents('Obsah', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ 1. REPOZITÁŘ ============
const ch1 = [
  h('1. Repozitář projektu', HeadingLevel.HEADING_1),
  p('Veřejný repozitář na GitHubu:'),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'https://github.com/rimet245/audio-library', font: MONO, size: 22, bold: true })],
  }),
  p(
    'Celý projekt je veřejně dostupný na výše uvedené adrese. Repozitář obsahuje zdrojové soubory ' +
    'v TypeScriptu (složka src/), přeložený JavaScript (dist/), vstupní HTML stránku, styly a tuto ' +
    'dokumentaci ve složce docs/. Historie commitů zachycuje postupný vývoj projektu od první fáze ' +
    '(teoretický návrh) až po finální implementaci uživatelského rozhraní.'
  ),
  p(
    'Aplikaci je možné spustit lokálně, nevyžaduje žádný server ani databázi — vše běží přímo v prohlížeči.'
  ),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ 2. UŽIVATELSKÁ PŘÍRUČKA ============
const ch2 = [
  h('2. Uživatelská příručka', HeadingLevel.HEADING_1),
  p(
    'Audio Library je jednoduchá webová aplikace, která se chová jako malý domácí přehrávač s playlistem. ' +
    'Umožňuje přidávat hudební skladby a podcastové epizody, sledovat jejich celkovou délku a velikost ' +
    'a u podcastů zaznamenávat, kolik z nich už mám poslechnuto.'
  ),

  h('2.1 Spuštění aplikace', HeadingLevel.HEADING_2),
  p('Aplikaci spustím ve třech krocích z kořenové složky projektu:'),
  bullet('', [
    new TextRun({ text: 'npm install', font: MONO, size: 22 }),
    new TextRun({ text: ' — stáhne TypeScript (jediná vývojová závislost).', font: FONT, size: 22 }),
  ]),
  bullet('', [
    new TextRun({ text: 'npm run build', font: MONO, size: 22 }),
    new TextRun({ text: ' — přeloží soubory src/*.ts do dist/*.js.', font: FONT, size: 22 }),
  ]),
  bullet('', [
    new TextRun({ text: 'npm run serve', font: MONO, size: 22 }),
    new TextRun({ text: ' — spustí lokální server na portu 5173.', font: FONT, size: 22 }),
  ]),
  p(
    'Poté otevřu v prohlížeči adresu http://localhost:5173 a aplikace je připravená k použití. ' +
    'Při startu se automaticky načte ukázkový katalog s několika skladbami a podcasty.'
  ),

  h('2.2 Přidání položky', HeadingLevel.HEADING_2),
  p(
    'V levém panelu „Přidat položku" vyplním formulář: vyberu typ (skladba / podcast), zadám název, ' +
    'autora a délku v minutách a sekundách. U skladby se navíc zobrazí pole pro žánr — u podcastu se toto ' +
    'pole automaticky skryje, protože žánr u mluveného slova nedává smysl. Po stisknutí tlačítka ' +
    '„Přidat do knihovny" se položka okamžitě objeví v pravém panelu a souhrn dole se přepočítá. ' +
    'Formulář nepřidá položku, pokud chybí název, autor nebo je délka nulová.'
  ),
  image('ui-desktop.png', 560, 513),
  caption('Snímek 1 — Desktop: formulář (vlevo) a knihovna s kartami (vpravo).'),

  h('2.3 Filtrování a souhrn', HeadingLevel.HEADING_2),
  p(
    'Nad seznamem položek jsou tři filtry: Vše, Skladby, Podcasty. Kliknutím přepnu, které položky se ' +
    'zobrazují — filtr ovlivňuje pouze zobrazení, samotný obsah knihovny zůstává nezměněný. V patičce ' +
    'pravého panelu vidím průběžně počítaný souhrn: počet položek, celkovou délku (ve formátu h:mm:ss) ' +
    'a celkovou velikost v MB.'
  ),
  image('ui-desktop-filter.png', 560, 401),
  caption('Snímek 2 — Desktop: aktivní filtr „Podcasty" a souhrn za celou knihovnu dole.'),

  h('2.4 Práce s podcastem a odebírání položek', HeadingLevel.HEADING_2),
  p(
    'U každé podcastové epizody je posuvník progresu poslechu. Když ho posunu, popisek epizody i vizuální ' +
    'pruh se okamžitě aktualizují a ukážou nové procento doposlechnuto. Každou položku lze odebrat ' +
    'tlačítkem „Odebrat" v jejím záhlaví — po odebrání se seznam i souhrn ihned překreslí.'
  ),
  image('ui-card-podcast.png', 360, 223),
  caption('Snímek 3 — Detail karty podcastu s posuvníkem progresu (zde 35 %).'),

  h('2.5 Responzivní zobrazení na mobilu', HeadingLevel.HEADING_2),
  p(
    'Rozhraní je plně responzivní. Na širší obrazovce jsou formulář a knihovna vedle sebe ve dvou ' +
    'sloupcích; na mobilu (šířka do 800 px) se rozvržení automaticky přeskládá do jednoho sloupce pod ' +
    'sebe a karty se zúží tak, aby zůstaly čitelné a ovladatelné prstem.'
  ),
  image('ui-mobile.png', 153, 820),
  caption('Snímek 4 — Mobil: jednosloupcové zobrazení (šířka do 800 px).'),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ 3. PROGRAMÁTORSKÝ ROZBOR ============
const ch3 = [
  h('3. Programátorský rozbor', HeadingLevel.HEADING_1),

  h('3.1 Cíle projektu', HeadingLevel.HEADING_2),
  p(
    'Hlavním cílem projektu bylo ukázat, že rozumím čtyřem základním pilířům objektově orientovaného ' +
    'programování — abstrakci, zapouzdření, dědičnosti a polymorfismu — a umím je použít ve smysluplné ' +
    'reálné aplikaci, ne jen jako formální cvičení. Téma audio knihovny jsem zvolil proto, že přirozeně ' +
    'vyžaduje rozdělení obsahu na různé typy (hudba vs. podcast), které mají společný základ, ale liší se ' +
    'v detailech. To je přesně situace, ve které OOP dává smysl.'
  ),
  p(
    'Ve třetí fázi jsem k hotové objektové logice doplnil interaktivní uživatelské rozhraní: původní výpis ' +
    'do konzole jsem nahradil formulářem a dynamicky vykreslovanými kartami, které se přepočítávají bez ' +
    'znovunačtení stránky.'
  ),

  h('3.2 Architektura tříd a UML diagram', HeadingLevel.HEADING_2),
  p(
    'Architektura stojí na jedné abstraktní rodičovské třídě a dvou potomcích, doplněných o třídu Library, ' +
    'která drží kolekci položek:'
  ),
  code('abstract class AudioItem'),
  code('├── class Track    extends AudioItem'),
  code('└── class Podcast  extends AudioItem'),
  code('class Library   o── AudioItem[]   (obsahuje kolekci)'),
  bullet('AudioItem — abstraktní pojem „audio obsah". Šablona, ze které se nikdy přímo nic nevytváří. Definuje společný kontrakt.'),
  bullet('Track — hudební skladba. Má žánr, velikost počítá podle kvality typické pro hudbu (192 kbps).'),
  bullet('Podcast — epizoda mluveného slova. Má progres poslechu, velikost počítá podle nižší kvality (64 kbps).'),
  bullet('Library — kolekce položek, se kterou aplikace pracuje jednotně, bez ohledu na jejich typ.'),
  p(
    'Vztah mezi Track / Podcast a AudioItem je dědičnost („is-a" — Track je AudioItem). Vztah mezi Library ' +
    'a položkami je kompozice („has-a" — knihovna obsahuje kolekci AudioItem).'
  ),
  image('uml-diagram.png', 360, 534),
  caption('Obrázek 1 — UML diagram tříd projektu Audio Library.'),
  p(
    'Znaménka v diagramu vyjadřují modifikátor přístupu: # je protected, - je private, + je public. ' +
    'Hvězdička u metody značí abstraktní metodu. Prázdná trojúhelníková šipka označuje dědičnost, ' +
    'kosočtverec u Library kompozici.'
  ),

  h('3.3 Jak aplikace funguje „pod kapotou"', HeadingLevel.HEADING_2),
  p(
    'Po načtení stránky se spustí soubor main.ts (přeložený do dist/main.js a připojený přes ' +
    '<script type="module">). Ten vytvoří jednu instanci třídy Library naplněnou počátečními daty ' +
    'z katalogu (data.ts) a zavolá funkci render(), která vykreslí seznam karet a souhrn.'
  ),
  p(
    'Veškerá interakce funguje na jednoduchém principu: jakmile se data změní, zavolá se znovu render(). ' +
    'Přidání položky, odebrání, změna progresu nebo přepnutí filtru — vždy se aktualizuje datový stav ' +
    'v knihovně a poté se celý seznam a souhrn překreslí z aktuálních dat. Díky tomu nemůže nastat ' +
    'nesoulad mezi tím, co je v knihovně, a tím, co vidím na obrazovce.'
  ),

  h('3.4 Propojení logiky tříd s HTML (DOM)', HeadingLevel.HEADING_2),
  p(
    'HTML stránka (index.html) definuje kostru rozhraní — formulář s konkrétními id (např. #item-title, ' +
    '#item-type), kontejner pro karty #catalog a prvky souhrnu #stat-count, #stat-duration, #stat-size. ' +
    'Soubor main.ts si na tyto prvky uloží reference pomocnou funkcí need(), která navíc srozumitelně ' +
    'zhavaruje, pokud by prvek v HTML chyběl.'
  ),
  p('Propojení funguje obousměrně:'),
  bullet('Z HTML do logiky: při odeslání formuláře přečtu hodnoty z polí, vytvořím odpovídající objekt (Track nebo Podcast) a přidám ho do knihovny metodou library.add().'),
  bullet('Z logiky do HTML: funkce renderCatalog() projde položky knihovny a pro každou vytvoří kartu (<article>) s popisem, metadaty a u podcastu i posuvníkem. Souhrn vykreslí renderSummary() z metod library.count, totalDuration() a totalSize().'),
  p(
    'Karty se nevytvářejí ručně v HTML — generují se v JavaScriptu pomocnou funkcí el(), která zkráceně ' +
    'vytvoří prvek s třídou a textem. To udržuje vykreslovací kód čitelný.'
  ),

  h('3.5 Využití principů OOP', HeadingLevel.HEADING_2),
  why('Abstrakce —',
    'Třída AudioItem je abstract: nelze z ní vytvořit instanci, slouží jen jako šablona. Definuje dvě ' +
    'abstraktní metody (getInfo(), calculateSize()), které musí každý potomek implementovat. Kód pracující ' +
    's knihovnou se dívá jen na tento společný kontrakt, ne na konkrétní typ.'
  ),
  why('Zapouzdření —',
    'Atributy jsou protected (na rodiči) nebo private (na potomcích). Atribut _progress u podcastu je ' +
    'chráněný setterem, který hodnotu vždy ořeže do rozsahu 0–1 pomocí Math.max(0, Math.min(1, value)). ' +
    'I přiřazení v konstruktoru jde přes tento setter, takže validaci nelze obejít. Pole items ve třídě ' +
    'Library je private — zvenčí se k němu dá jen přes bezpečné metody.'
  ),
  why('Dědičnost —',
    'Track i Podcast přebírají od AudioItem vše společné (název, autora, délku, metodu formatDuration()). ' +
    'Společný kód se píše jen jednou. V konstruktoru volají super(), který naplní zděděné atributy.'
  ),
  why('Polymorfismus —',
    'Knihovna drží pole typu AudioItem[], ve kterém jsou smíchané skladby i podcasty. Když počítám ' +
    'celkovou velikost, jen zavolám item.calculateSize() na každém prvku — bez jediného if, bez zjišťování ' +
    'typu. Každý objekt sám ví, jak se spočítat. Kdybych přidal třetí typ (např. audioknihu), tento kód ' +
    'bych vůbec nemusel měnit.'
  ),
  p(
    'Příklad polymorfismu z kódu: ve funkci renderSummary() volám library.totalSize(), která uvnitř dělá ' +
    'items.reduce((sum, item) => sum + item.calculateSize(), 0). Stejné volání, různé chování podle ' +
    'skutečného typu objektu — to je jádro celého návrhu.'
  ),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ 4. VÝPIS ZDROJOVÉHO KÓDU ============
const ch4 = [
  h('4. Výpis zdrojového kódu', HeadingLevel.HEADING_1),
  p(
    'Níže je uveden kompletní zdrojový kód, který jsem v projektu programoval, opatřený komentáři. ' +
    'Kód knihoven a frameworků uveden není. Formátování neproporcionálním písmem (Consolas).'
  ),

  fileHeading('src/models/AudioItem.ts'),
  why('Proč abstraktní třída?',
    'AudioItem reprezentuje pojem, který v doméně nemá konkrétní instanci — neexistuje „audio obsah" sám ' +
    'o sobě, vždy jde buď o skladbu, nebo o podcast. Modifikátor abstract tuto skutečnost vynucuje na ' +
    'úrovni kompilátoru: pokus o new AudioItem(...) je odmítnut. Tím získávám jedno místo pro definici ' +
    'společného kontraktu a zároveň zabraňuji vytvoření nesmyslného objektu.'
  ),
  why('Proč parameter properties a protected?',
    'Atributy deklaruji přímo v hlavičce konstruktoru (protected title: string) — TypeScript je tak vytvoří ' +
    'jako pole třídy a rovnou přiřadí, čímž eliminuji trojí opakování (deklarace, parametr, přiřazení). ' +
    'Zvolil jsem protected místo private, protože potomci Track a Podcast k těmto atributům přistupují ve ' +
    'svých metodách getInfo(). Naopak read-only getter durationInSeconds jsem doplnil proto, aby Library ' +
    'mohla sčítat délky, aniž bych musel atribut zveřejnit pro zápis — hodnotu lze přečíst, ne přepsat.'
  ),
  codeBlock(readSrc('src/models/AudioItem.ts')),

  fileHeading('src/models/Track.ts'),
  why('Proč private genre?',
    'Žánr je interní detail skladby, který žádná jiná třída ani potomek nepotřebuje přímo měnit — proto ' +
    'jsem zvolil přísnější private namísto protected. Drží to zapouzdření co nejtěsnější (princip ' +
    'nejmenšího nutného přístupu).'
  ),
  why('Proč přípona .js v importu a fixní bitrate?',
    'Cesta importu je vědomě zakončená ./AudioItem.js, přestože zdrojový soubor je .ts — po překladu do ' +
    'nativních ES modulů musí import odkazovat na výsledný JavaScript, jinak by prohlížeč soubor nenašel. ' +
    'Velikost počítám vzorcem (duration × 192) / 8 / 1024: 192 kbps je standardní bitrate hudby, dělení ' +
    'osmi převádí bity na bajty, dělení 1024 na megabajty.'
  ),
  codeBlock(readSrc('src/models/Track.ts')),

  fileHeading('src/models/Podcast.ts'),
  why('Proč setter místo parameter property?',
    'Na rozdíl od genre u skladby potřebuje _progress validaci — hodnota musí zůstat v rozsahu 0–1. Proto ' +
    'jsem nepoužil zkratku v konstruktoru, ale klasickou deklaraci private _progress spolu s getterem ' +
    'a setterem. Setter ořezává hodnotu přes Math.max(0, Math.min(1, value)). Klíčové je, že i konstruktor ' +
    'zapisuje přes this.progress = progress, tedy přes setter — validaci tak nelze obejít ani při vytváření ' +
    'objektu. Podtržítko v názvu signalizuje, že jde o vnitřní atribut, k němuž se přistupuje přes property ' +
    'progress.'
  ),
  why('Proč nižší bitrate?',
    'Velikost počítám se 64 kbps, protože mluvené slovo se kóduje v nižší kvalitě než hudba — ucho v něm ' +
    'postrádá detail méně než u hudby. Stejný vzorec, jiná konstanta: ukázka, že specifické chování patří ' +
    'do potomka, ne do rodiče.'
  ),
  codeBlock(readSrc('src/models/Podcast.ts')),

  fileHeading('src/Library.ts'),
  why('Proč samostatná třída pro kolekci?',
    'Mohl bych pracovat s holým polem AudioItem[], ale zapouzdřením do třídy Library získávám kontrolu nad ' +
    'tím, co se s kolekcí dá dělat. Pole items je private — zvenčí k němu nelze sáhnout přímo, jen přes ' +
    'metody add(), remove(), getAll() a souhrnné výpočty. To brání tomu, aby UI omylem porušilo vnitřní ' +
    'stav knihovny.'
  ),
  why('Proč kopie vstupního pole a polymorfní součty?',
    'V konstruktoru ukládám [...initial] (mělká kopie), aby pozdější změny v knihovně neovlivnily původní ' +
    'katalog — vyhýbám se sdílení reference. Metody totalDuration() a totalSize() používají reduce() ' +
    'a volají společné členy AudioItem bez rozlišování typu. Díky tomu se Library nemusí měnit, ani když ' +
    'přibude nový typ položky — to je praktický přínos polymorfismu.'
  ),
  codeBlock(readSrc('src/Library.ts')),

  fileHeading('src/data.ts'),
  why('Proč oddělit data od logiky?',
    'Katalog jsem vyčlenil do samostatného souboru, abych oddělil „co aplikace obsahuje" od „jak aplikace ' +
    'funguje". Pole je typované jako AudioItem[], ačkoli reálně drží instance Track i Podcast — to je možné ' +
    'právě díky dědičnosti a je to základ, na kterém staví polymorfní zpracování ve zbytku aplikace. ' +
    'Přidání nové položky znamená jediný řádek tady; typování ani iterace v main.ts se nemění.'
  ),
  codeBlock(readSrc('src/data.ts')),

  fileHeading('src/main.ts'),
  why('Proč „překresli všechno" místo dílčích úprav DOM?',
    'Po každé změně dat volám render(), která znovu sestaví celý seznam i souhrn z aktuálního stavu ' +
    'knihovny. Zvolil jsem tento přístup vědomě: je jednodušší a hlavně vylučuje nesoulad mezi datovým ' +
    'modelem a tím, co vidím na obrazovce. Při této velikosti aplikace je výkonová režie zanedbatelná.'
  ),
  why('Proč instanceof a pomocné funkce?',
    'Konkrétní typ řeším jen na jediném místě — u posuvníku progresu (item instanceof Podcast), protože ' +
    'jen tam se UI skutečně liší. Vše ostatní jede přes polymorfní getInfo(), formatDuration() ' +
    'a calculateSize(). Funkce need() získává reference na HTML prvky a srozumitelně zhavaruje, kdyby prvek ' +
    'chyběl (defenzivní programování); el() zkracuje opakované vytváření prvků. Index pro odebrání hledám ' +
    'v původním poli přes indexOf(), aby filtr nezpůsobil odebrání špatné položky.'
  ),
  codeBlock(readSrc('src/main.ts')),

  fileHeading('index.html'),
  why('Proč sémantické prvky a stabilní id?',
    'Stránka je jen kostra — veškerý obsah seznamu generuje JavaScript. Použil jsem sémantické značky ' +
    '(<header>, <main>, <section>, <article>) a atributy aria-labelledby kvůli přístupnosti a čitelnosti ' +
    'struktury. Každý interaktivní prvek má stabilní id (např. item-title), na které se z TypeScriptu ' +
    'napojuji — id tvoří smluvené rozhraní mezi HTML a logikou. Skript připojuji jako type="module", ' +
    'protože kód používá ES moduly (import/export).'
  ),
  codeBlock(readSrc('index.html')),

  fileHeading('styles.css'),
  why('Proč CSS proměnné a Grid + Flexbox?',
    'Odstíny šedi, poloměry rohů a tloušťky linek jsem vynesl do proměnných v :root, aby se celý vzhled ' +
    'dal měnit z jednoho místa. Pro hlavní rozvržení jsem zvolil CSS Grid (dva sloupce 320px 1fr), protože ' +
    'jde o dvourozměrné rozložení stránky; uvnitř karet a souhrnu používám Flexbox, vhodný pro ' +
    'jednorozměrné řazení prvků. Mřížku karet řeším přes repeat(auto-fill, minmax(230px, 1fr)) — karty se ' +
    'samy přizpůsobí šířce.'
  ),
  why('Proč černobílý, minimalistický vzhled?',
    'Rozhraní jsem záměrně navrhl jako čistě černobílé a minimalistické (inspirováno designem Applu): ' +
    'světlé pozadí, bílé panely, vlasové linky a hodně volného místa. Žádné výrazné barvy — typ položky ' +
    'proto rozlišuju tvarem: skladba má odznak jen s obrysem, podcast plný černý. Pilulková tlačítka ' +
    'a velká klidná typografie podtrhují přehlednost. Význam tak nese kontrast a tvar, ne barva.'
  ),
  why('Proč media query na 800 px?',
    'Responzivitu řeším jediným zlomovým bodem: pod 800 px se dvousloupcový grid přepne na jeden sloupec ' +
    '(grid-template-columns: 1fr) a zmenší se nadpis. Záměrně jsem nepoužil framework jako Bootstrap — pro ' +
    'tento rozsah by šlo o zbytečnou závislost a vlastní CSS mi dává plnou kontrolu i lepší pochopení toho, ' +
    'co se děje.'
  ),
  codeBlock(readSrc('styles.css')),
];

// ============ DOKUMENT ============
const doc = new Document({
  creator: 'Audio Library Project',
  title: 'Audio Library — Část III.',
  description: 'UI, responzivita a finální dokumentace OOP projektu',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: '1D1D1F' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: '1D1D1F' },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
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
                new TextRun({ text: 'Audio Library — Část III.    |    Strana ', font: FONT, size: 18, color: '666666' }),
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
        ...tocPage,
        ...ch1,
        ...ch2,
        ...ch3,
        ...ch4,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, 'Audio_Library_Cast_III.docx');
  fs.writeFileSync(out, buf);
  console.log('OK:', out, buf.length, 'bytes');
});
