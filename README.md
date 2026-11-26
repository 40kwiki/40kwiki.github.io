# 40,000 Wiki

A Wikipedia-style encyclopedia of the Warhammer 40,000 setting, served by GitHub Pages at
https://martin-k-m.github.io/warpedia/.

Personal, non-commercial fan project. Not affiliated with Games Workshop or the Wikimedia Foundation.

## How it works

- `src/articles/*.html`: one file per page. Front matter on top, article HTML below.
- `src/template.html`, `src/assets/`: the skin (Vector 2022 layout, dark mode, page previews, search).
- `build.py`: turns the sources into `docs/`, which GitHub Pages serves. Python 3 standard library only.

```bash
python3 build.py
python3 -m http.server 8641 -d docs
```

Commit `docs/` with the sources. Pages serves `main` branch, `/docs` folder.

## Writing an article

Create `src/articles/Title_With_Underscores.html`:

```html
---
title: Golden Throne
short: Life-support machine of the Emperor of Mankind
image: golden-throne.jpg
updated: 2026-11-25
redirects: The Golden Throne | Throne of Terra
categories: Imperium of Mankind | Artefacts
---
<p>The <b>Golden Throne</b> is ... [[Emperor of Mankind]] ...<ref name="mom"/></p>
<h2>History</h2>
<h3>Construction</h3>
...
<h2>References</h2>
<references>
<ref name="mom"><cite class="citation">Dembski-Bowden, Aaron (2016). <i>Master of Mankind</i>. Black Library.</cite></ref>
</references>
```

Markup the build understands:

| Markup | Result |
|---|---|
| `[[Title]]`, `[[Title\|label]]`, `[[Title#Section]]`, `[[Ork]]s` | Wiki links. Missing pages become red links. |
| `<ref name="x">text</ref>`, `<ref name="x"/>` | Numbered footnotes with backlinks |
| `<ref group="note">text</ref>` + `<references group="note"/>` | Lettered explanatory notes |
| `<references> ...defs... </references>` | List-defined references |
| `<h2>`, `<h3>` | Sections, table of contents, edit links |

Front matter lists (`redirects`, `categories`) are separated with `|`. Category pages are generated.

Reusable blocks (copy from `Imperium_of_Mankind.html`): `table.infobox`, `figure.thumb`,
`.hatnote`, `.wikitable`, `.navbox`, `.div-col`, `.refbegin`, `.cn` (citation needed).

Images go in `src/assets/img/`. Credit every image in its caption with `<span class="credit">`.
