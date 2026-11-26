# Contributing to 40,000 Wiki

Thanks for helping. 40,000 Wiki is a Wikipedia-style encyclopedia of Warhammer 40,000 lore, read at https://40kwiki.github.io/.

## Ways to help

- **Fix or report a mistake.** Open an issue with the page name and what is wrong, ideally with the book it comes from.
- **Write a missing article.** Red links on any page are articles we want. Pick one and open a pull request.
- **Improve an article.** Add facts, dates, links, timelines or better art.

## How articles work

- Each article is one file in `src/articles/`, named after its title with spaces as underscores (`Horus_Heresy.html`).
- Read `STYLE.md` before writing. The short version:
  - The prose is written in-universe, as the Imperium's own encyclopedia, with Imperial dates (`005.M31`).
  - The references cite real published works (codexes, Black Library novels, the Horus Heresy books) with edition and page where you can. Never invent a source.
  - Plain sentences, no em dashes, Wikipedia layout: infobox, lead, sections, timeline, See also, References.
- Markup is in `README.md`: `[[Links]]`, `<ref>` citations, `{{navbox:Name}}`, `{{portal:Name}}`.
- Images go in `src/assets/img/` with a `data-credit` attribute naming the artist or source.

## Building

You need Python 3, nothing else.

```bash
python3 build.py
```

This writes the site to `docs/`, which GitHub Pages serves. Open `docs/index.html` or run `python3 -m http.server --directory docs` to check your page, then open a pull request. Please do not include unrelated changes in `docs/`; a maintainer rebuilds it on merge.

## Ground rules

- Lore follows the newest material. Older accounts can appear as "earlier" or "disputed" records.
- Be kind in issues and reviews.
- 40,000 Wiki is an unofficial fan project, not affiliated with Games Workshop. Warhammer 40,000 and all associated names are trademarks of Games Workshop Limited.
