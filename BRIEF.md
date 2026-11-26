# Writer brief (shared by every writer agent)

You write articles for "40,000 Wiki", a static Wikipedia clone of Warhammer 40,000 lore written fully
IN-UNIVERSE. Repo: /Users/martinmuskov/Docs/GitHub/misc/warpedia.

1. Read STYLE.md and README.md in full, then two finished articles as models:
   src/articles/Horus_Heresy.html and src/articles/Rogal_Dorn.html (or Ultramarines.html for units).
2. List existing titles: `ls src/articles` (and the `redirects:` lines) so you link to the exact
   titles that exist. Link everything else freely; red links are wanted.
3. Lore must match the NEWEST material (Siege of Terra series, The End and the Death, Era Indomitus,
   10th edition and newer). Lexicanum blocks curl; use the Fandom API
   (`api.php?action=parse&page=X&prop=wikitext&format=json`) and web search to check facts. Write in
   your own words. Where newer material replaced older, give the newer version and note the older as
   an earlier or disputed Imperial record.
4. Images per STYLE.md "Images" and "Image choice": newest depiction, symbols for organisations.
   View every image before using it.
5. Only create/edit the files you are told to. No git. Check the build with
   `WIKI_OUT=$(mktemp -d) python3 build.py` (never into docs/).
6. Infoboxes: people use `infobox royalty`, wars and battles use `infobox military` (STYLE.md "Infobox colours").
   Infobox art: full, dramatic, current painted art, portrait crop, no watermarks (crop with python3 PIL).
7. Do not write pages another writer owns. Check `ls src/articles` again just before writing each file;
   if it already exists, skip it and say so. Add sensible `redirects:` (alternative names, planets for
   campaigns) only when no existing page uses that title.
8. Dates: give a date for every event, reign, founding and death you mention, in the Imperial
   calendar. Where no record gives one, give the best estimate as "c. 650.M35" or "mid-M38" and, if it is
   only inferred, say so in a note (e.g. "date estimated from the sequence of events"). Infobox dates too.
   Add a short dated timeline (wikitable or list) to every history-heavy article.
9. Links: link the first mention of every person, place, organisation, office, rank, world type, event and
   concept, in prose AND in infoboxes and tables. Check `ls src/articles` and redirects so the link hits
   an existing page whenever one exists.
10. Reply with: titles written, word counts, images, and any facts you could not verify.
