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
8. Reply with: titles written, word counts, images, and any facts you could not verify.
