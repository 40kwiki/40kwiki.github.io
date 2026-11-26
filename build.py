#!/usr/bin/env python3
"""Build 40,000 Wiki: src/articles/*.html -> docs/ (served by GitHub Pages)."""
import datetime
import html
import json
import os
import re
import shutil
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
OUT = Path(os.environ.get("WIKI_OUT", HERE / "docs"))
REPO = "martin-k-m/warpedia"
GH = f"https://github.com/{REPO}"
ROOT = "../../"


def norm(t):
    t = re.sub(r"[\s_]+", " ", t).strip()
    return t[:1].upper() + t[1:]


def slug(t):
    return norm(t).replace(" ", "_").replace(":", "_")


def anchor(text):
    return html.escape(re.sub(r"\s+", "_", strip_tags(text).strip()), quote=True)


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def parse(path):
    raw = path.read_text(encoding="utf-8")
    meta, body = {}, raw
    m = re.match(r"---\n(.*?)\n---\n", raw, re.S)
    if m:
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
        body = raw[m.end():]
    meta.setdefault("title", path.stem.replace("_", " "))
    meta.setdefault("kind", "article")
    for k in ("categories", "redirects"):
        meta[k] = [x.strip() for x in meta.get(k, "").split("|") if x.strip()]
    return {"meta": meta, "body": body, "file": path.name, "title": norm(meta["title"])}


class Lead(HTMLParser):
    """Plain text of the first paragraph that is not inside a table, figure or div."""

    SKIP = {"table", "figure", "div", "sup", "style"}

    def __init__(self):
        super().__init__()
        self.stack, self.buf, self.done, self.inp = [], [], False, False

    def handle_starttag(self, tag, attrs):
        if tag in ("br", "img", "wbr", "hr", "meta", "link", "input"):
            return
        self.stack.append(tag)
        if tag == "p" and not self.done and not (set(self.stack[:-1]) & self.SKIP):
            self.inp = True

    def handle_endtag(self, tag):
        if tag in self.stack:
            while self.stack and self.stack.pop() != tag:
                pass
        if tag == "p" and self.inp:
            self.inp, self.done = False, bool("".join(self.buf).strip())

    def handle_data(self, d):
        if self.inp and "sup" not in self.stack:
            self.buf.append(d)


def lead_text(body):
    p = Lead()
    p.feed(body)
    return re.sub(r"\s+", " ", "".join(p.buf)).strip()


def render_links(body, page, titles, redirects):
    links = []
    rx = re.compile(r"\[\[([^\[\]|]+?)(?:\|([^\[\]]*))?\]\]([a-z]*)")

    def repl(m):
        target, label, trail = m.group(1), m.group(2), m.group(3)
        t, _, frag = target.partition("#")
        title = norm(t) if t.strip() else page["title"]
        text = (label if label else target.strip().replace("_", " ")) + trail
        hash_ = "#" + anchor(frag) if frag else ""
        real = redirects.get(title, title)
        if title not in links:
            links.append(title)
        if real == page["title"] and not frag:
            return f'<a class="mw-selflink selflink">{text}</a>'
        if real in titles:
            cls = ' class="mw-redirect"' if title != real else ""
            return f'<a href="{ROOT}wiki/{slug(real)}/{hash_}" title="{html.escape(real)}"{cls}>{text}</a>'
        q = urllib.parse.quote(title)
        return (f'<a href="{ROOT}wiki/Special_Missing/?title={q}" class="new" '
                f'title="{html.escape(title)} (page does not exist)">{text}</a>')

    return rx.sub(repl, body), links


def render_refs(body):
    groups = {}  # group -> list of {key, text, uses}
    defs = {}  # list-defined references: <references> <ref name="x">text</ref> ... </references>

    def collect(m):
        for name, text in re.findall(r'<ref\s+name="([^"]+)"[^>]*>(.*?)</ref>', m.group(2), re.S):
            defs[name] = text
        return f"<references{m.group(1)}/>"

    body = re.sub(r"<references\b([^>/]*)>(.*?)</references>", collect, body, flags=re.S)

    def label(group, n):
        return chr(96 + n) if group == "note" else str(n)

    def repl(m):
        attrs, content = m.group(1), m.group(3)
        name = re.search(r'name="([^"]+)"', attrs)
        group = re.search(r'group="([^"]+)"', attrs)
        group = group.group(1) if group else ""
        lst = groups.setdefault(group, [])
        key = name.group(1) if name else f"_{len(lst)}_{id(m)}"
        ref = next((r for r in lst if r["key"] == key), None)
        if ref is None:
            ref = {"key": key, "text": content or defs.get(key, ""), "uses": 0, "n": len(lst) + 1}
            lst.append(ref)
        elif content and not ref["text"]:
            ref["text"] = content
        ref["uses"] += 1
        pre = f"{group}-" if group else ""
        nid = f"cite_note-{pre}{ref['n']}"
        rid = f"cite_ref-{pre}{ref['n']}-{ref['uses']}"
        lab = label(group, ref["n"])
        if group:
            lab = f"{group} {lab}" if group != "note" else lab
        return f'<sup id="{rid}" class="reference"><a href="#{nid}">[{lab}]</a></sup>'

    body = re.sub(r"<ref\b([^>]*?)(/>|>(.*?)</ref>)", repl, body, flags=re.S)

    def reflist(m):
        group = re.search(r'group="([^"]+)"', m.group(0))
        group = group.group(1) if group else ""
        pre = f"{group}-" if group else ""
        items = []
        for r in groups.get(group, []):
            nid = f"cite_note-{pre}{r['n']}"
            if r["uses"] == 1:
                back = f'<a href="#cite_ref-{pre}{r["n"]}-1" aria-label="Jump up">^</a>'
            else:
                ls = " ".join(f'<a href="#cite_ref-{pre}{r["n"]}-{i}"><sup><i><b>{chr(96 + i)}</b></i></sup></a>'
                              for i in range(1, r["uses"] + 1))
                back = f"^ {ls}"
            items.append(f'<li id="{nid}"><span class="mw-cite-backlink">{back}</span> '
                         f'<span class="reference-text">{r["text"].strip()}</span></li>')
        cls = "references lower-alpha" if group == "note" else "references"
        return f'<div class="reflist"><ol class="{cls}">{"".join(items)}</ol></div>'

    return re.sub(r"<references\b[^>]*/>", reflist, body)


def render_headings(body, page):
    toc = []
    seen = {}

    def repl(m):
        level, inner = int(m.group(1)), m.group(2)
        aid = anchor(inner)
        if aid in seen:
            seen[aid] += 1
            aid = f"{aid}_{seen[aid]}"
        else:
            seen[aid] = 1
        toc.append((level, aid, strip_tags(inner)))
        edit = ""
        if page["meta"]["kind"] == "article":
            edit = (f'<span class="mw-editsection"><span class="br">[</span>'
                    f'<a href="{GH}/edit/main/src/articles/{page["file"]}">edit</a>'
                    f'<span class="br">]</span></span>')
        return f'<div class="mw-heading mw-heading{level}"><h{level} id="{aid}">{inner}</h{level}>{edit}</div>'

    body = re.sub(r"<h([23])>(.*?)</h\1>", repl, body, flags=re.S)
    return body, toc


def toc_html(toc):
    if not toc:
        return ""
    out = ['<li class="toc-l1"><a href="#">(Top)</a></li>']
    i = 0
    while i < len(toc):
        level, aid, text = toc[i]
        if level != 2:
            i += 1
            continue
        kids = []
        i += 1
        while i < len(toc) and toc[i][0] == 3:
            kids.append(toc[i])
            i += 1
        sub = ""
        btn = ""
        if kids:
            sub = "<ul>" + "".join(f'<li class="toc-l2"><a href="#{k[1]}">{html.escape(k[2])}</a></li>' for k in kids) + "</ul>"
            btn = ('<button class="toc-toggle" aria-expanded="false" aria-label="Toggle '
                   f'{html.escape(text)} subsection"><svg viewBox="0 0 20 20"><path d="m6 4 8 6-8 6z"/></svg></button>')
        out.append(f'<li class="toc-l1">{btn}<a href="#{aid}">{html.escape(text)}</a>{sub}</li>')
    return "<ul>" + "".join(out) + "</ul>"


def build():
    template = (SRC / "template.html").read_text(encoding="utf-8")
    pages = [parse(p) for p in sorted((SRC / "articles").glob("*.html"))]

    # Category pages are generated from front matter.
    cats = {}
    for p in pages:
        for c in p["meta"]["categories"]:
            cats.setdefault(norm(c), []).append(p["title"])
    for c, members in cats.items():
        pages.append({"meta": {"title": f"Category:{c}", "kind": "category", "categories": [], "redirects": [],
                               "short": f"Pages in the category {c}"},
                      "body": "", "file": None, "title": f"Category:{c}", "members": sorted(members)})

    titles = {p["title"] for p in pages}
    redirects = {}
    for p in pages:
        for r in p["meta"]["redirects"]:
            redirects[norm(r)] = p["title"]
    for t in titles:  # a real article always wins over a redirect of the same name
        redirects.pop(t, None)

    articles = [p for p in pages if p["meta"]["kind"] == "article"]
    count = len(articles)

    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "wiki").mkdir(parents=True)
    shutil.copytree(SRC / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")

    index = []
    today = datetime.date.today()
    for p in pages:
        meta, kind = p["meta"], p["meta"]["kind"]
        body = p["body"].replace("{{NUMBEROFARTICLES}}", f"{count:,}").replace("{{ARTICLECOUNT}}", f"{count:,} article" + ("" if count == 1 else "s"))
        if kind == "category":
            body = category_body(p, titles)
        body = re.sub(r"\{\{navbox:([^}]+)\}\}", lambda m: (SRC / "navboxes" / (m.group(1).strip() + ".html")).read_text(encoding="utf-8"), body)
        if p["title"] == "Special:ImageCredits":
            body = body.replace("{{CREDITS}}", credits_html(pages))
        body, links = render_links(body, p, titles, redirects)
        body = render_refs(body)
        body, toc = render_headings(body, p)
        p["links"] = links

        updated = meta.get("updated") or today.isoformat()
        d = datetime.date.fromisoformat(updated)
        catlinks = ""
        if meta["categories"]:
            items = "".join(f'<li><a href="{ROOT}wiki/{slug("Category:" + c)}/">{html.escape(c)}</a></li>'
                            for c in meta["categories"])
            catlinks = (f'<div class="catlinks"><a href="{ROOT}wiki/Special_AllPages/">Categories</a>: '
                        f"<ul>{items}</ul></div>")
        display = p["title"]
        if kind in ("category", "special"):
            ns, _, rest = display.partition(":")
            display = f'<span class="mw-page-title-namespace">{ns}</span>:<span class="mw-page-title-main">{html.escape(rest)}</span>'
        else:
            display = f'<span class="mw-page-title-main">{html.escape(display)}</span>'

        if kind == "special":
            tabs_left = '<a class="sel" href="#">Special page</a>'
            tabs_right = ""
        else:
            talk_q = urllib.parse.quote(p["title"])
            tabs_left = (f'<a class="sel" href="./">{"Category" if kind == "category" else ("Main Page" if kind == "main" else "Article")}</a>'
                         f'<a href="{GH}/issues?q={talk_q}" title="Discussion about the page">Talk</a>')
            src = f"src/articles/{p['file']}" if p["file"] else "build.py"
            tabs_right = (f'<a class="sel" href="./">Read</a>'
                          f'<a href="{GH}/edit/main/{src}" title="Edit this page on GitHub">Edit</a>'
                          f'<a href="{GH}/commits/main/{src}" title="Past revisions of this page">View history</a>')
        tools_src = f"{GH}/blob/main/src/articles/{p['file']}" if p["file"] else GH
        values = {
            "TITLE": html.escape(p["title"]),
            "DISPLAYTITLE": display,
            "DESC": html.escape(meta.get("short", "") or lead_text(body)[:160]),
            "ROOT": ROOT,
            "BODYCLASS": f"ns-{kind}" + ("" if toc else " no-toc"),
            "TOC": toc_html(toc),
            "TABS_LEFT": tabs_left,
            "TABS_RIGHT": tabs_right,
            "BODY": body,
            "CATLINKS": catlinks,
            "UPDATED": f"{d.day} {d.strftime('%B %Y')}",
            "SOURCE": tools_src,
            "GH": GH,
            "WHATLINKS": f"{ROOT}wiki/Special_WhatLinksHere/?target={urllib.parse.quote(p['title'])}",
        }
        out = template
        for k, v in values.items():
            out = out.replace("{{" + k + "}}", v)
        dest = OUT / "wiki" / slug(p["title"])
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "index.html").write_text(out, encoding="utf-8")

        text = strip_tags(re.sub(r"<(table|style|sup)\b.*?</\1>", " ", body, flags=re.S))
        entry = {"t": p["title"], "k": kind[0], "d": meta.get("short", ""), "x": lead_text(body)[:420],
                 "l": links, "b": re.sub(r"\s+", " ", text)[:40000]}
        if meta.get("image"):
            entry["i"] = meta["image"]
        index.append(entry)

    for alias, target in redirects.items():
        dest = OUT / "wiki" / slug(alias)
        dest.mkdir(parents=True, exist_ok=True)
        to = f"../{slug(target)}/?redirectedfrom={urllib.parse.quote(alias)}"
        (dest / "index.html").write_text(
            f'<!DOCTYPE html><meta charset="utf-8"><title>{html.escape(alias)}</title>'
            f'<meta http-equiv="refresh" content="0; url={to}">'
            f'<script>location.replace("{to}"+location.hash)</script>'
            f'<p>Redirecting to <a href="{to}">{html.escape(target)}</a>.</p>', encoding="utf-8")
        index.append({"t": alias, "k": "r", "r": target})

    (OUT / "assets" / "pages.js").write_text(
        "window.WP_PAGES=" + json.dumps(index, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    (OUT / "index.html").write_text(
        '<!DOCTYPE html><meta charset="utf-8"><title>40,000 Wiki</title>'
        '<meta http-equiv="refresh" content="0; url=wiki/Main_Page/">'
        '<link rel="canonical" href="wiki/Main_Page/"><a href="wiki/Main_Page/">40,000 Wiki</a>', encoding="utf-8")
    (OUT / "404.html").write_text(
        (OUT / "wiki" / "Special_Missing" / "index.html").read_text(encoding="utf-8")
        .replace('"../../', '"/warpedia/'), encoding="utf-8")
    print(f"Built {count} articles, {len(cats)} categories, {len(redirects)} redirects -> {OUT}")


def credits_html(pages):
    seen, rows = set(), []
    for p in pages:
        for src, credit in re.findall(r'<img[^>]*src="[^"]*?assets/img/([^"]+)"[^>]*data-credit="([^"]*)"', p["body"]):
            if src in seen:
                continue
            seen.add(src)
            rows.append(f'<tr><td><img src="{ROOT}assets/img/{src}" width="90" alt="" loading="lazy"></td><td><code>{src}</code></td>'
                        f'<td>{credit}</td><td>[[{p["title"]}]]</td></tr>')
    return ('<table class="wikitable"><tr><th>Image</th><th>File</th><th>Credit and licence</th><th>First used on</th></tr>'
            + "".join(rows) + "</table>")


def category_body(p, titles):
    members = p["members"]
    by_letter = {}
    for m in members:
        by_letter.setdefault(m[0].upper(), []).append(m)
    cols = "".join(f'<div class="mw-category-group"><h3 class="cat-letter">{k}</h3><ul>'
                   + "".join(f"<li>[[{m}]]</li>" for m in v) + "</ul></div>"
                   for k, v in sorted(by_letter.items()))
    n = len(members)
    return (f'<div id="mw-pages"><h2 class="cat-h2">Pages in category "{html.escape(p["title"][9:])}"</h2>'
            f"<p>The following {n} page{'s' if n != 1 else ''} {'are' if n != 1 else 'is'} in this category, "
            f"out of {n} total.</p><div class=\"mw-category\">{cols}</div></div>")


if __name__ == "__main__":
    build()
