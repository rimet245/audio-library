const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Footer, AlignmentType, LevelFormat, PageNumber, PageBreak,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
} = require('docx');

const FONT = 'Arial';
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;

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

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, font: FONT, size: 22 })],
  });

const code = (text) =>
  new Paragraph({
    spacing: { after: 60, line: 280 },
    shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text, font: 'Consolas', size: 20 })],
  });

const blank = () => new Paragraph({ children: [new TextRun('')] });

// ------- table helper -------
const border = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: border, bottom: border, left: border, right: border };

function makeTable(header, rows, widths) {
  const totalW = widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: header.map((text, i) =>
      new TableCell({
        borders,
        width: { size: widths[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'D9E2F3' },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 22, bold: true })] })],
      })
    ),
  });
  const bodyRows = rows.map((row) =>
    new TableRow({
      children: row.map((text, i) =>
        new TableCell({
          borders,
          width: { size: widths[i], type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 22 })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}

// ============ TITLE PAGE ============
const titlePage = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 240 },
    children: [new TextRun({ text: 'Průmyslová škola, obor IT', font: FONT, size: 28, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
    children: [new TextRun({ text: '2. ročník — Programování', font: FONT, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 120 },
    children: [new TextRun({ text: 'Ročníkový projekt — Část I.', font: FONT, size: 32, bold: true, color: '2E5C8A' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'Teoretický rozbor a architektonický návrh', font: FONT, size: 26, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 120 },
    children: [new TextRun({ text: 'Audio Library', font: FONT, size: 44, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2400 },
    children: [new TextRun({ text: 'Webová aplikace pro správu hudebního playlistu', font: FONT, size: 24, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Autor: __________________________', font: FONT, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Třída: __________________________', font: FONT, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Školní rok: 2025 / 2026', font: FONT, size: 24 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ TOC ============
const tocPage = [
  h('Obsah', HeadingLevel.HEADING_1),
  new TableOfContents('Obsah', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============ CHAPTER 1 ============
const ch1 = [
  h('1. Téma projektu', HeadingLevel.HEADING_1),

  h('1.1 Co aplikace dělá', HeadingLevel.HEADING_2),
  p(
    'Audio Library je webová aplikace, která se chová jako malý domácí hudební přehrávač s playlistem. ' +
    'Představte si, že si večer skládáte poslech na cestu — pár písniček a třeba jednu epizodu oblíbeného podcastu, ' +
    'abyste věděli, jak dlouho vám to vystačí. Aplikace přesně tohle umožňuje: na levé straně stránky ukáže katalog ' +
    'toho, co je k dispozici, uživatel si vybírá, co chce přidat, a vpravo se mu postupně staví playlist. U každé ' +
    'změny se přepočítá celková délka poslechu a místo v MB, které by playlist zabral.'
  ),
  p(
    'Aplikace běží přímo v prohlížeči, je napsaná v TypeScriptu a s HTML stránkou je propojená přes DOM. ' +
    'Žádný server ani databáze — všechno se odehrává v paměti prohlížeče.'
  ),

  h('1.2 Proč zrovna audio knihovna', HeadingLevel.HEADING_2),
  p(
    'Hledal jsem téma, které má přirozenou potřebu rozdělit se na různé typy obsahu, aby OOP nebylo jen formální cvičení. ' +
    'Hudba a podcast se na první pohled tváří podobně — obojí je zvuk, který má autora a nějakou délku — ale chovají se ' +
    'odlišně. Skladbu posloucháme vcelku a od začátku, podcast postupně, často po částech, a aplikace by si měla pamatovat, ' +
    'kde jsme skončili. Hudba se navíc nahrává v mnohem vyšší kvalitě než mluvené slovo, takže i velikost souboru se počítá ' +
    'jiným vzorcem. A přesně tahle dualita — společný základ, odlišné chování — je to, kvůli čemu objektové programování existuje.'
  ),

  h('1.3 Co aplikace počítá a zobrazuje', HeadingLevel.HEADING_2),
  p(
    'U každé položky v playlistu aplikace ukazuje její název, autora a délku ve formátu mm:ss. K tomu si průběžně počítá ' +
    'velikost v MB — u skladeb podle kvality typické pro hudbu, u podcastů podle nižší kvality typické pro mluvené slovo. ' +
    'V patičce playlistu pak svítí součet: kolik celkem hodin poslechu a kolik megabajtů. Když uživatel cokoli přidá, ' +
    'odebere nebo třeba u podcastu posune progres, čísla se okamžitě přepočítají.'
  ),

  h('1.4 Cíle projektu', HeadingLevel.HEADING_2),
  p(
    'Hlavním cílem je ukázat, že rozumím čtyřem základním pilířům OOP — abstrakci, zapouzdření, dědičnosti a polymorfismu — ' +
    'a umím je použít v reálné aplikaci, ne jen v učebnicovém příkladu. Druhý cíl je oddělit data od logiky tak, aby se ' +
    'katalog dal kdykoli rozšířit (přidat skladbu, přidat epizodu) bez sahání do kódu. A třetí cíl je propojit všechno ' +
    's HTML stránkou tak, aby se zobrazení automaticky aktualizovalo při každé změně playlistu.'
  ),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ CHAPTER 2 ============
const ch2 = [
  h('2. Teoretický rozbor', HeadingLevel.HEADING_1),

  h('2.1 Co mají všechny audio nahrávky společné', HeadingLevel.HEADING_2),
  p(
    'Když se zamyslím nad tím, co je „audio obsah", narazím na společný základ a na specifika. ' +
    'Společné mají všechny nahrávky to, že mají nějaký název, někdo je vytvořil a mají určitou délku v sekundách. ' +
    'To platí jak pro tříminutovou písničku, tak pro hodinový rozhovor. Tenhle společný základ tvoří první vrstvu — ' +
    'rodičovskou třídu AudioItem.'
  ),
  p(
    'Specifika pak začínají, když jdu do detailu. U hudební skladby je důležitý žánr, protože uživatel si podle něj ' +
    'třídí knihovnu. U podcastu naopak žádný žánr neřeším, ale potřebuji vědět, kolik z epizody už uživatel poslechl, ' +
    'aby mohl pokračovat tam, kde skončil. Tyhle odlišnosti patří do potomků — Tracku a Podcastu.'
  ),

  h('2.2 Klíčové entity', HeadingLevel.HEADING_2),
  p('V systému rozeznávám pět entit:'),
  bullet('AudioItem — abstraktní pojem „audio obsah". Je to šablona, ze které se nikdy přímo nic nevytváří.'),
  bullet('Track — hudební skladba. Má žánr a velikost počítá podle kvality typické pro hudbu (192 kbps).'),
  bullet('Podcast — epizoda mluveného slova. Má progres poslechu a velikost počítá podle nižší kvality (64 kbps).'),
  bullet('Playlist — kolekce položek, se kterou aplikace pracuje jednotně, bez ohledu na jejich typ.'),
  bullet('Catalog — datový soubor (data.ts), ze kterého aplikace položky bere. Reprezentuje knihovnu k dispozici.'),

  h('2.3 Vztahy mezi entitami', HeadingLevel.HEADING_2),
  p(
    'Vztah mezi Trackem a AudioItem (a mezi Podcastem a AudioItem) je dědičnost — anglicky se říká „is-a". ' +
    'Track JE AudioItem, podobně jako labrador JE pes. Track má všechno, co AudioItem (název, autora, délku), ' +
    'a navíc si přidává něco svého (žánr).'
  ),
  p(
    'Vztah mezi Playlistem a jeho položkami je naopak kompozice — „has-a". Playlist OBSAHUJE kolekci AudioItem. ' +
    'Položky v playlistu jsou samostatné objekty v paměti, žijí nezávisle na katalogu — z katalogu si při vzniku ' +
    'jen „nasají" základní údaje a dál existují samy za sebe. Když uživatel u jedné položky v playlistu změní progres, ' +
    'katalog to nijak neovlivní.'
  ),

  h('2.4 Proč to neudělat bez OOP', HeadingLevel.HEADING_2),
  p(
    'Bez objektů by aplikace musela u každého výpočtu zjišťovat, s čím vlastně pracuje: „jsi skladba, nebo podcast?" ' +
    'a podle toho volit jiný kód. To by znamenalo if/else po celé aplikaci — při výpočtu velikosti, při výpisu, při ' +
    'řazení, prostě všude. A kdybych v budoucnu chtěl přidat třetí typ, třeba audioknihu, musel bych ty if/else dohledat ' +
    'a doplnit na desítkách míst.'
  ),
  p(
    'Objektový návrh tenhle problém řeší tím, že každý objekt sám ví, jak se má spočítat a jak se má představit. ' +
    'Aplikace mu jen řekne „spočítej se" a o zbytek se nestará. Nový typ pak přidám jako novou třídu dědící od AudioItem ' +
    'a celý zbytek aplikace funguje dál — beze změny. Tomuhle se říká škálovatelná architektura a je to hlavní praktický ' +
    'přínos, který OOP přináší.'
  ),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ CHAPTER 3 ============
const ch3 = [
  h('3. Architektonický návrh tříd', HeadingLevel.HEADING_1),

  h('3.1 Hierarchie', HeadingLevel.HEADING_2),
  p('Architektura má jednoduchou strukturu — jednu rodičovskou abstraktní třídu a dva její potomky:'),
  code('abstract class AudioItem'),
  code('├── class Track    extends AudioItem'),
  code('└── class Podcast  extends AudioItem'),
  p(
    'AudioItem definuje, co každý „audio obsah" musí umět. Track a Podcast tuhle šablonu naplňují vlastním způsobem.'
  ),

  h('3.2 AudioItem — abstraktní rodič', HeadingLevel.HEADING_2),
  p(
    'AudioItem je třída, ze které se nikdy přímo nic nevytváří. Slouží jako šablona, kontrakt — definuje, co ' +
    'každý potomek musí poskytnout, a co naopak mají všechny varianty společné. Klíčové slovo abstract zajišťuje, ' +
    'že kdyby si někdo omylem chtěl vytvořit „prázdný" AudioItem bez žánru a bez progresu, kompilátor ho zastaví ' +
    'už při překladu. To je důležité — díky tomu se nesmyslný stav vůbec nemůže dostat do běžícího programu.'
  ),
  blank(),

  makeTable(
    ['Prvek', 'Modifikátor', 'Typ', 'Popis'],
    [
      ['_id', 'protected', 'number', 'Unikátní ID položky (z katalogu).'],
      ['_title', 'protected', 'string', 'Název skladby nebo epizody.'],
      ['_author', 'protected', 'string', 'Interpret skladby nebo autor podcastu.'],
      ['_duration', 'protected', 'number', 'Délka v sekundách.'],
      ['set duration(v)', 'public', 'void', 'Setter — nepustí dál zápornou hodnotu.'],
      ['getInfo()', 'public abstract', 'string', 'Krátký textový popis. Implementuje potomek.'],
      ['calculateSize()', 'public abstract', 'number', 'Velikost v MB. Implementuje potomek.'],
      ['formatDuration()', 'public', 'string', 'Společná metoda — převede sekundy na mm:ss.'],
    ],
    [2400, 1900, 1500, 3560]
  ),
  blank(),
  p(
    'Atributy začínají podtržítkem a jsou označené jako protected. To znamená, že k nim nikdo zvenčí nesahá ' +
    'přímo — komunikuje se s nimi přes settery. Když by někdo chtěl zapsat do _duration zápornou hodnotu, setter ' +
    'to nepustí dál. Tomuhle se říká zapouzdření a smyslem je, aby si objekt sám hlídal svou integritu, místo aby ' +
    'spoléhal na to, že okolní kód bude vždy korektní.'
  ),

  h('3.3 Track — hudební skladba', HeadingLevel.HEADING_2),
  p(
    'Track je první ze dvou potomků. Reprezentuje hudební skladbu a jediná věc, kterou si oproti AudioItem přidává, ' +
    'je žánr. Velikost souboru počítá z toho, že hudba se obvykle nahrává v kvalitě 192 kbps — tuhle hodnotu mám ' +
    'napevno uvnitř třídy, protože uživatele detail bitrate nezajímá. Vzorec je (délka × 192) / 8 / 1024 ' +
    'a vyjde mi velikost v megabajtech.'
  ),
  blank(),

  makeTable(
    ['Prvek', 'Modifikátor', 'Typ', 'Popis'],
    [
      ['_genre', 'private', 'string', 'Hudební žánr (pop, rock, klasika, …).'],
      ['set genre(v)', 'public', 'void', 'Setter — nepustí prázdný řetězec.'],
      ['getInfo()', 'public', 'string', 'Vrací „[Track] název — autor (žánr)".'],
      ['calculateSize()', 'public', 'number', 'Vzorec (duration × 192) / 8 / 1024.'],
    ],
    [2400, 1900, 1500, 3560]
  ),

  h('3.4 Podcast — epizoda mluveného slova', HeadingLevel.HEADING_2),
  p(
    'Podcast je druhý potomek. Specifický atribut je _progress — desetinné číslo od 0 do 1, které říká, kolik z ' +
    'epizody už uživatel poslechl. Nula znamená „začátek", jednička „doposlechnuto", 0.5 „v půlce". Setter se ' +
    'postará, aby tam někdo nezadal 1.5 nebo -0.2 — pokud by se to stalo, ořízne hodnotu na povolený rozsah ' +
    'a do konzole napíše varování.'
  ),
  p(
    'Velikost se počítá stejným vzorcem jako u Tracku, ale s bitrate 64 kbps. Mluvené slovo se ukládá v menší ' +
    'kvalitě než hudba, protože ucho v něm slyší méně detailů a vyšší bitrate by byl jen ztráta místa.'
  ),
  blank(),

  makeTable(
    ['Prvek', 'Modifikátor', 'Typ', 'Popis'],
    [
      ['_progress', 'private', 'number', 'Pozice v epizodě (0.0 až 1.0).'],
      ['set progress(v)', 'public', 'void', 'Setter — ořízne hodnotu na rozsah 0–1.'],
      ['getInfo()', 'public', 'string', 'Vrací „[Podcast] název — autor (XX % posloucháno)".'],
      ['calculateSize()', 'public', 'number', 'Vzorec (duration × 64) / 8 / 1024.'],
    ],
    [2400, 1900, 1500, 3560]
  ),

  h('3.5 Jak se v tom potkávají všechny čtyři principy OOP', HeadingLevel.HEADING_2),
  p(
    'Abstrakce je v tom, že rodičovská třída AudioItem vůbec neřeší, jestli jde o skladbu, nebo podcast. ' +
    'Kód, který pracuje s playlistem, se prostě dívá na audio obsah jako takový a nic víc o něm vědět nepotřebuje. ' +
    'Detaily zůstávají schované v potomcích, kde mají co dělat.'
  ),
  p(
    'Zapouzdření je vidět na tom, že každý atribut je private nebo protected a dostupný jen přes settery. ' +
    'Když by někdo zkusil nastavit progres na 1.5, setter ho přepíše na 1 a do konzole napíše „Progres mimo ' +
    'rozsah, oříznuto na 1." Místo aby se aplikace v takové chvíli rozbila někde uvnitř, problém se chytí na vstupu.'
  ),
  p(
    'Dědičnost znamená, že Track i Podcast přebírají od AudioItem všechno společné — id, název, autora, délku ' +
    'i pomocnou metodu formatDuration. Společný kód píšu jen jednou, na jednom místě. Kdybych ho psal zvlášť pro ' +
    'každý typ, dříve nebo později se obě verze rozejdou a vznikne těžko hledaná chyba.'
  ),
  p(
    'A nakonec polymorfismus — to nejdůležitější a zároveň to, co dává celému návrhu smysl. Playlist mám napsaný ' +
    'jako pole typu AudioItem[]. Když chci spočítat celkovou velikost, projdu pole a u každé položky zavolám ' +
    'item.calculateSize(). TypeScript v té chvíli vidí jen typ AudioItem, ale za běhu se sám rozhodne, kterou ' +
    'implementaci pustí — tu z Tracku, nebo tu z Podcastu. Volající kód neví a nepotřebuje vědět, který je který. ' +
    'Tomuhle se říká dynamické vázání a je to konkrétní mechanismus, na kterém polymorfismus stojí.'
  ),

  h('3.6 Polymorfismus na konkrétním kusu kódu', HeadingLevel.HEADING_2),
  p('Výpočet celkové velikosti playlistu vypadá v aplikaci takhle:'),
  code('const playlist: AudioItem[] = [track1, podcast1, track2];'),
  code(''),
  code('const totalMB = playlist.reduce('),
  code('  (sum, item) => sum + item.calculateSize(),'),
  code('  0'),
  code(');'),
  blank(),
  p(
    'Na první pohled to vypadá triviálně. Síla je v tom, co tam není: žádné if. Žádné rozlišování typu. ' +
    'A pokud bych zítra přidal třetí třídu — třeba Audiobook s vlastním vzorcem na velikost — tenhle řádek ' +
    'kódu se nezmění ani o znak. Stačí napsat novou třídu, která dědí od AudioItem a implementuje calculateSize() ' +
    'a getInfo() po svém. Zbytek aplikace ji rovnou „rozpozná" a bude s ní umět pracovat.'
  ),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ CHAPTER 4 — UML ============
const umlImage = fs.readFileSync('/Users/work/Documents/audio-library/mermaid-diagram-2026-05-04-124801-final.png');

const ch4 = [
  h('4. UML diagram tříd', HeadingLevel.HEADING_1),
  p(
    'Diagram na následující stránce zachycuje kompletní hierarchii navržených tříd v notaci UML. Znaménka před ' +
    'jednotlivými prvky vyjadřují modifikátor přístupu: + je veřejný (public), # je chráněný (protected) a − ' +
    'soukromý (private). Kurzívou jsou zvýrazněny abstraktní metody a název abstraktní třídy. Šipka ' +
    's prázdným trojúhelníkem od potomka k rodiči znamená dědičnost — anglicky extends.'
  ),
  blank(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240 },
    children: [
      new ImageRun({
        type: 'png',
        data: umlImage,
        transformation: { width: 460, height: 580 },
        altText: {
          title: 'UML diagram tříd Audio Library',
          description: 'Hierarchie abstraktní třídy AudioItem se dvěma potomky Track a Podcast.',
          name: 'umlDiagram',
        },
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: 'Obrázek 1 — UML diagram tříd projektu Audio Library', font: FONT, size: 20, italics: true })],
  }),

  h('4.1 Co je z diagramu vidět', HeadingLevel.HEADING_2),
  p(
    'AudioItem je v diagramu vyznačena jako «abstract» — z ní samotné nelze vytvořit instanci, slouží pouze jako ' +
    'společný základ. Obsahuje protected atributy (přístupné potomkům, ne okolnímu kódu) a dvě abstraktní metody ' +
    'getInfo() a calculateSize(), které jsou v diagramu kurzívou. To je vizuální signál, že tyhle metody musí ' +
    'každý potomek povinně implementovat.'
  ),
  p(
    'Track a Podcast jsou s rodičem propojeny prázdnou trojúhelníkovou šipkou, což je standardní UML notace pro ' +
    'dědičnost. Oba potomci mají abstraktní metody přepsané vlastní implementací (jejich názvy už nejsou kurzívou) ' +
    'a každý si přidává jeden specifický atribut: Track má _genre, Podcast má _progress. Soukromé atributy ' +
    '(označené −) jsou vždy doplněny veřejným setterem (+), který validuje vstup.'
  ),

  new Paragraph({ children: [new PageBreak()] }),
];

// ============ CHAPTER 5 ============
const ch5 = [
  h('5. Závěr Části I.', HeadingLevel.HEADING_1),
  p(
    'V této první fázi jsem si zvolil téma Audio Library a navrhl pro něj kompletní objektovou architekturu. ' +
    'Vybral jsem si ho proto, že hudba a podcast jsou dva typy obsahu, které mají hodně společného, ale chovají ' +
    'se odlišně — a to je přesně situace, kterou OOP řeší elegantněji než procedurální kód.'
  ),
  p('Návrh splňuje všechny povinné body zadání:'),
  bullet('Jedna abstraktní rodičovská třída AudioItem, která definuje společný kontrakt.'),
  bullet('Dva konkrétní potomci Track a Podcast, kteří kontrakt naplňují vlastní specifickou logikou.'),
  bullet('Polymorfismus — playlist typu AudioItem[] s jednotným voláním calculateSize() a getInfo() bez rozlišování typu.'),
  bullet('Zapouzdření — všechny atributy jsou private nebo protected a přístupné jen přes settery s validací.'),
  p(
    'Architektura je navržená tak, aby byla rozšiřitelná. Pokud budu v budoucnu chtít přidat třetí typ obsahu — ' +
    'například audioknihu s atributem počtu kapitol — stačí napsat novou třídu dědící od AudioItem a implementovat ' +
    'dvě abstraktní metody. Zbytek aplikace, včetně playlistu, sčítání velikosti i vykreslování v HTML, ' +
    'zůstane beze změny. Právě v téhle vlastnosti vidím největší přínos zvoleného přístupu.'
  ),
  p(
    'Druhá část projektu naváže implementací — vznikne soubor data.ts s katalogem, jednotlivé třídy v TypeScriptu, ' +
    'propojení s HTML stránkou přes DOM a responzivní rozhraní s katalogem na levé straně a playlistem na pravé.'
  ),
  blank(),
  h('Repozitář projektu', HeadingLevel.HEADING_2),
  p('Veřejný repozitář na GitHubu: https://github.com/rimet245/audio-library'),
];

// ============ DOCUMENT ============
const doc = new Document({
  creator: 'Audio Library Project',
  title: 'Audio Library — Část I.',
  description: 'Teoretický rozbor a architektonický návrh OOP projektu',
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
                new TextRun({ text: 'Audio Library — Část I.    |    Strana ', font: FONT, size: 18, color: '666666' }),
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
        ...ch5,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = '/Users/work/Documents/audio-library/Audio_Library_Cast_I.docx';
  fs.writeFileSync(out, buf);
  console.log('OK:', out, buf.length, 'bytes');
});
