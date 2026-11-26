# 40,000 Wiki style guide

40,000 Wiki is the encyclopedia the Imperium would keep if it had a Wikipedia. It is written
**entirely in-universe**, by neutral Imperial scholars in the early 42nd millennium (the Era Indomitus).
It must read exactly like a modern English Wikipedia article.

## In-universe rules (hard)

- In the prose, never mention Games Workshop, the tabletop game, miniatures, editions, novels, authors,
  artists, "fiction", "lore", "canon", "retcon", "setting", "fans" or real-world years. The
  references section is the exception: it cites real books (see Sources and citations).
- Every date uses the Imperial calendar: `005.M31`, `c. 798.M30`, `M36`, `the late 41st millennium`.
- Contradictions in the sources become in-universe disagreements: "Imperial accounts differ",
  "Ecclesiarchy tradition holds…, while Mechanicus records…", "sealed by Inquisitorial edict".
- The Emperor's divinity is described as doctrine of the Imperial Cult, not as fact. Chaos is real
  and described soberly. Censored topics can say "records are sealed" or "[data expunged]".
- Lore is current with the newest books and campaign material (Siege of Terra and The End and the Death, Era Indomitus, 10th edition and newer). Newer accounts are the accepted version; older ones appear as "earlier" or "disputed" Imperial records.
- Neutral encyclopedic tone. No in-character ranting, no jokes, no "grimdark".
- No em dashes (—). Use commas, colons or full stops. En dashes in date ranges are fine (005–014.M31).
- Accuracy matters: the facts must match established 40k and Horus Heresy lore. Check details against
  https://wh40k.lexicanum.com and https://warhammer40k.fandom.com (read with curl). Write in your own
  words; never copy sentences from those sites.

## Sources and citations (Martin, 2026-11-26)

The prose stays in-universe. The **references cite the real published works** the facts come from:
codexes, campaign books, Black Library novels and audio dramas, the Forge World Horus Heresy books,
White Dwarf, the roleplaying game books. This is a lore encyclopedia, so cite the lore source, never
tabletop rules.

- Take the sources from the matching Fandom article's own footnotes and Sources list
  (`api.php?action=parse&prop=wikitext&format=json&page=X`): they give book, edition and page.
  Cite only a work that really covers that fact. Never invent a book, page or chapter.
- Format: `<cite class="citation">Author (year). <i>Title</i> (edition or format). Publisher. pp. or ch.</cite>`,
  e.g. `Abnett, Dan (2006). <i>Horus Rising</i> (novel). Black Library. ch. 3.` or
  `<i>Codex: Space Marines</i> (10th edition, 2023). Games Workshop. pp. 10-14.` Leave out what you
  do not know (year, page); never guess.
- If no book can be pinned down, cite the reference article: `"Horus". <i>Warhammer 40k Wiki</i> (Fandom).`
- Use list-defined references (see Imperium_of_Mankind.html), named refs reused across the article,
  and explanatory notes with `group="note"`. "Further reading" lists real novels and books.

## Article shape (match Wikipedia)

1. Short hatnote if needed. 2. Infobox (always). 3. Lead: 2–4 paragraphs that summarise the whole
article, title in bold in the first sentence, alternative names in bold. 4. Sections with `<h2>`/`<h3>`.
5. "See also", "Notes", "References", optionally "Further reading" (in-universe texts). 6. Navbox
include. Categories and redirects in front matter.

Typical sections: **People** Early life / Discovery / Great Crusade / Horus Heresy / Later life or Fate /
Legacy / Character and abilities / Wargear. **Legions and Chapters** History / Organisation /
Homeworld / Combat doctrine / Beliefs and culture / Gene-seed / Successors / Heraldry / Notable
members. **Wars** Background / Prelude / Battle or Course of the war / Aftermath / Legacy.
**Institutions** History / Organisation / Powers / Members / Relations with other Adepta.

Length: major subjects (Emperor, Heresy, a primarch, a First Founding Legion) 2,500–4,500 words;
smaller ones 1,200–2,500. Dense with `[[links]]`: link the first mention of every person, place,
organisation, battle and concept, even if no article exists yet (that makes a red link, which is
wanted).

## Markup

See README.md. Key pieces: `[[Title]]`, `[[Title|label]]`, `<ref name="x"/>`, `<references>…</references>`,
`<ref group="note">`, `<h2>`, `<h3>`. Copy HTML patterns from `src/articles/Imperium_of_Mankind.html`:
`table.infobox` (rows: `infobox-above`, `infobox-subheader`, `infobox-image`, `mergedtop`,
`infobox-header`, `sub`), `figure.thumb` (add `left` or `wide`), `.hatnote`, `.wikitable` in a
`.table-wrap`, `.div-col`, `.quotebox`.

Shared navboxes: put `{{navbox:Imperium}}`, `{{navbox:Primarchs}}`, `{{navbox:Legions}}` or
`{{navbox:Horus_Heresy}}` at the very end of the article (several are fine).

### Infobox for a battle or war (Wikipedia "military conflict")

```html
<table class="infobox"><tbody>
<tr><th colspan="2" class="infobox-above">Siege of Terra</th></tr>
<tr><td colspan="2" class="infobox-subheader">Part of the [[Horus Heresy]]</td></tr>
<tr><td colspan="2" class="infobox-image"><img src="../../assets/img/x.jpg" width="300" alt="" data-credit="Artwork © Games Workshop"><div class="caption">Caption</div></td></tr>
<tr class="mergedtop"><th class="infobox-label">Date</th><td>c. 013–014.M31</td></tr>
<tr><th class="infobox-label">Location</th><td>[[Terra]], [[Sol System]]</td></tr>
<tr><th class="infobox-label">Result</th><td>Loyalist victory…</td></tr>
<tr class="mergedtop"><th colspan="2" class="infobox-header" style="text-align:center">Belligerents</th></tr>
<tr><td>Loyalists list</td><td>Traitors list</td></tr>
<tr class="mergedtop"><th colspan="2" class="infobox-header" style="text-align:center">Commanders and leaders</th></tr>
<tr><td>…</td><td>…</td></tr>
<tr class="mergedtop"><th colspan="2" class="infobox-header" style="text-align:center">Strength</th></tr>
<tr><td>…</td><td>…</td></tr>
<tr class="mergedtop"><th colspan="2" class="infobox-header" style="text-align:center">Casualties and losses</th></tr>
<tr><td>…</td><td>…</td></tr>
</tbody></table>
```

### Infobox for a person: rows Title(s), Allegiance, Legion, Homeworld, Born/Created, Discovered,
Died/Status, Relatives (plainlist), Wargear, Known for. Use `infobox-header` rows for groups.

### Infobox for a Legion or Chapter: Founding, Legion number, Primarch, Homeworld, Fortress,
Allegiance, Successor Chapters, Colours, Battle cry, Size, Notable battles, plus the heraldry image.

## Images

Pull official art from the Fandom wiki API (Martin approved this for personal, non-commercial use):

```bash
curl -s -A "Mozilla/5.0" --get https://warhammer40k.fandom.com/api.php \
  --data-urlencode action=query --data-urlencode prop=images --data-urlencode imlimit=50 \
  --data-urlencode format=json --data-urlencode "titles=Rogal_Dorn"
curl -s -A "Mozilla/5.0" --get https://warhammer40k.fandom.com/api.php \
  --data-urlencode action=query --data-urlencode prop=imageinfo --data-urlencode iiprop=url \
  --data-urlencode format=json --data-urlencode "titles=File:Example.jpg"
```

Download to `src/assets/img/<article-slug>-<short>.jpg` (lower case), then
`sips -s format jpeg -Z 1200 file --out file`. Look at what you download before using it: no logos of
publishers, no watermark-heavy images, no photos of miniatures or people. 2–5 images per article.
Every `<img>` gets `data-credit="Artwork © Games Workshop"` (or the real licence for other sources).
Captions are in-universe ("Votive fresco of…", "Pict-capture of…", "Heraldry of the…"). No visible
credit text in captions; the build lists all credits on Special:ImageCredits.

## Image choice (Martin, 2026-11-25)

- Use the most up-to-date in-universe depiction. A person's infobox shows them as they are now:
  Lion El'Jonson as returned in the 42nd millennium, Guilliman as Lord Commander in the Era Indomitus,
  daemon primarchs in their daemonic form; older depictions go lower in the article.
- Organisations lead with their **symbol**: a Legion or Chapter infobox shows its Legion/Chapter
  icon (heraldic badge), not the primarch. Same for the Inquisition (the I), Adeptus Mechanicus
  (the cog-skull), Custodes, Administratum, Ecclesiarchy, Chaos (the eight-pointed star), the
  Chaos Gods (their marks), xenos factions (their glyphs). Prefer transparent PNG or SVG icons
  (Fandom has many, e.g. "File:Ultramarines Livery.png", "*_Icon.png", "*Symbol*.svg"); keep
  PNG/SVG as is (do not convert icons to JPEG); put them on `background:var(--img-bg)`.
- Add symbols where Wikipedia would: heraldry in Legion tables, faction marks in war infobox
  belligerent lists (small 20px icons before the name), sigils in navboxes are not needed.

## Infobox colours (Martin, 2026-11-25)

Match Wikipedia's coloured infoboxes:

- **People** (Emperor, primarchs, High Lords, Chapter Masters, Inquisitors, Abaddon...): `<table class="infobox royalty">`,
  like Wikipedia's royalty box. Shape: `infobox-above` name, `infobox-subheader` main style, image, then one
  `<tr class="mergedtop"><th colspan="2" class="infobox-header">[[Office]] of the [[X]]</th></tr>` per office with
  Tenure/Reign, Predecessor, Successor rows under it, then `<tr><td colspan="2" class="infobox-band"></td></tr>`,
  then the personal rows (Born/Created, Discovered, Died/Status, Allegiance, Homeworld, Other titles, Relatives, Wargear, Known for).
  See Roboute_Guilliman.html.
- **Wars and battles, Legions, Chapters, armies**: `<table class="infobox military">` (steel-blue title bar, grey section headers).
- Everything else keeps the plain `infobox`.
- Infobox pictures: full, dramatic, full-colour painted art of the subject as they are now; portrait orientation,
  face in the upper third; crop off any watermark.

## Symbols come from Lexicanum (Martin, 2026-11-25)

Legion, Chapter and organisation symbols use Lexicanum's files, saved as `src/assets/img/icon-<name>.png|jpg`
(icon-ultramarines.png, icon-inquisition.png, icon-ecclesiarchy.jpg...). Reuse those names; do not add other badge files.
Lexicanum blocks curl for pages but serves image files: open the page in the browser pane, read the
infobox `<img>` src, strip `/thumb/` and the size suffix, then curl `https://wh40k.lexicanum.com/mediawiki/images/<h>/<hh>/<File>`.

## Links and dates (Martin, 2026-11-25)

- The Imperium of Mankind page must have no red links. Check it after every wave.
- Link generously: first mention of everything, prose, infoboxes and tables. Prefer existing titles and redirects.
- Give years for everything. When no record has one, give an estimate ("c. 650.M35", "mid-M38") and note it as estimated.

## Conflict infoboxes (Martin, 2026-11-26)

Match Wikipedia's war infobox (see Horus_Heresy.html): in Belligerents, Commanders and leaders, and Strength,
every entry is its own line with a small flag icon and a link:
`<span class="fl"><img class="fi" src="../../assets/img/icon-ultramarines.png" alt="" data-credit="Artwork © Games Workshop">[[Roboute Guilliman]]</span>`.
- Icon = the side's or person's Legion, Chapter, order or faction symbol (`ls src/assets/img | grep icon-`; also aquila.svg, necrons-sigil.png, orks/tyranid marks).
- Supreme commanders in bold (`<b>[[Horus]]</b>`); add ` †` after anyone killed in that conflict.
- Strength: one line per force with icon and a number or size where recorded ("c. 120,000 Legionaries", "3 Titan Legions").
- Link most things. No plain-text names where a page or redirect exists.
- Fates after commander names, like Wikipedia: ` †` killed in action, ` (WIA)` wounded, ` (MIA)` missing in action, ` (POW)` captured, ` ‡` executed or murdered, ` (DOW)` died of wounds. Add a key row right after the Commanders row when any marker is used:
  `<tr><td colspan="2" class="infobox-key">† Killed in action · (WIA) Wounded · (MIA) Missing · (POW) Captured · ‡ Executed</td></tr>` (list only the markers used).
