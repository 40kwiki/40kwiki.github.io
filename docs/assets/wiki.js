(function () {
  'use strict';
  var D = document, H = D.documentElement, B = D.body;
  var ROOT = B.getAttribute('data-root') || '../../';
  var PAGES = window.WP_PAGES || [];
  var byTitle = {};
  PAGES.forEach(function (p) { byTitle[p.t] = p; });

  function $(s, el) { return (el || D).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || D).querySelectorAll(s)); }
  function slug(t) { return t.replace(/ /g, '_').replace(/:/g, '_'); }
  function pageUrl(t) { return ROOT + 'wiki/' + encodeURI(slug(t)) + '/'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function resolve(t) { var p = byTitle[t]; return p && p.k === 'r' ? byTitle[p.r] : p; }
  function articles() { return PAGES.filter(function (p) { return p.k === 'a'; }); }
  function param(n) { return new URLSearchParams(location.search).get(n); }
  function normTitle(t) { t = (t || '').replace(/[_\s]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ---------- Preferences ---------- */
  function prefs() { try { return JSON.parse(localStorage.getItem('wp-prefs') || '{}'); } catch (e) { return {}; } }
  function setPref(k, v) {
    var p = prefs(); p[k] = v;
    try { localStorage.setItem('wp-prefs', JSON.stringify(p)); } catch (e) { }
    apply(p);
  }
  function apply(p) {
    ['small', 'standard', 'large'].forEach(function (s) { H.classList.remove('wp-text-' + s); });
    H.classList.add('wp-text-' + (p.text || 'standard'));
    H.classList.toggle('wp-width-wide', p.width === 'wide');
    if (p.theme && p.theme !== 'auto') H.setAttribute('data-theme', p.theme); else H.removeAttribute('data-theme');
    H.classList.toggle('wp-toc-hidden', p.toc === 'hidden');
    H.classList.toggle('wp-appearance-hidden', p.appearance === 'hidden');
    $$('.appearance input').forEach(function (i) {
      var cur = { text: p.text || 'standard', width: p.width || 'standard', theme: p.theme || 'auto' }[i.name.split('-')[1]];
      i.checked = i.value === cur;
    });
  }
  function appearanceHtml(id, pinned) {
    function group(name, legend, opts) {
      return '<fieldset><legend>' + legend + '</legend>' + opts.map(function (o) {
        return '<label><input type="radio" name="' + id + '-' + name + '" value="' + o[0] + '">' + o[1] + '</label>';
      }).join('') + '</fieldset>';
    }
    return '<div class="menu-heading"><span>Appearance</span>' +
      (pinned ? '<button class="quiet-btn" data-hide-appearance>hide</button>' : '') + '</div>' +
      group('text', 'Text', [['small', 'Small'], ['standard', 'Standard'], ['large', 'Large']]) +
      group('width', 'Width', [['standard', 'Standard'], ['wide', 'Wide']]) +
      group('theme', 'Color <span style="font-weight:normal">(beta)</span>', [['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']]);
  }
  var pinned = $('#appearance-pinned'), drop = $('#appearance-drop');
  if (pinned) pinned.innerHTML = appearanceHtml('ap', true);
  if (drop) drop.innerHTML = appearanceHtml('ad', false) + '<p class="note" style="margin:0"><a href="#" data-show-appearance>Pin to sidebar</a></p>';
  D.addEventListener('change', function (e) {
    var i = e.target;
    if (i.closest && i.closest('.appearance, #appearance-drop')) setPref(i.name.split('-')[1], i.value);
  });
  D.addEventListener('click', function (e) {
    if (e.target.closest('[data-hide-appearance]')) { setPref('appearance', 'hidden'); }
    if (e.target.closest('[data-show-appearance]')) { e.preventDefault(); setPref('appearance', ''); closeAll(); }
  });
  apply(prefs());

  /* ---------- Dropdowns ---------- */
  function closeAll(except) {
    $$('.dropdown').forEach(function (d) { if (d !== except) d.hidden = true; });
    $$('[data-dropdown]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  D.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-dropdown]');
    if (btn) {
      e.preventDefault();
      var id = btn.getAttribute('data-dropdown');
      var menu = D.getElementById(id);
      if (id === 'toc-float') {
        // The sticky header and the title row share one floating contents menu.
        var host = btn.closest('#sticky') ? $('#sticky .sticky-inner') : $('.page-head');
        if (menu.parentNode !== host) host.appendChild(menu);
      }
      var open = menu.hidden;
      closeAll(menu);
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      return;
    }
    if (!e.target.closest('.dropdown')) closeAll();
    else if (e.target.closest('.toc-float a')) closeAll();
  });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); hidePopup(); closeLightbox(); } });

  /* ---------- Table of contents ---------- */
  var toc = $('#toc');
  var floatToc = $('#toc-float');
  if (toc && floatToc) {
    var list = toc.querySelector('ul');
    if (list) floatToc.innerHTML = '<div class="menu-heading">Contents</div>' + list.outerHTML;
    var hideBtn = $('#toc-hide');
    if (hideBtn) hideBtn.addEventListener('click', function () { setPref('toc', 'hidden'); });
    floatToc.insertAdjacentHTML('afterbegin', '');
    floatToc.addEventListener('click', function (e) {
      if (e.target.closest('[data-pin-toc]')) { e.preventDefault(); setPref('toc', ''); closeAll(); }
    });
    floatToc.insertAdjacentHTML('beforeend', '<p class="note" style="margin:8px 0 0;font-size:.75rem"><a href="#" data-pin-toc>Move to sidebar</a></p>');
  }
  D.addEventListener('click', function (e) {
    var t = e.target.closest('.toc-toggle');
    if (!t) return;
    var li = t.parentNode;
    li.classList.toggle('expanded');
    li.setAttribute('data-user', '');
    t.setAttribute('aria-expanded', String(li.classList.contains('expanded')));
  });
  var heads = $$('.mw-parser-output .mw-heading h2, .mw-parser-output .mw-heading h3');
  function markActive() {
    var y = window.scrollY + 90, cur = null;
    heads.forEach(function (h) { if (h.getBoundingClientRect().top + window.scrollY <= y) cur = h.id; });
    $$('.toc li').forEach(function (li) {
      li.classList.remove('toc-active');
      if (!li.hasAttribute('data-user')) li.classList.remove('expanded');
    });
    var links = cur ? $$('.toc a[href="#' + CSS.escape(cur) + '"]') : $$('.toc a[href="#"]');
    links.forEach(function (a) {
      var li = a.parentNode;
      li.classList.add('toc-active');
      var parent = li.parentNode.closest('li');
      if (parent) { parent.classList.add('toc-active', 'expanded'); }
      else if (li.querySelector('ul')) li.classList.add('expanded');
    });
  }

  /* ---------- Sticky header ---------- */
  var sticky = $('#sticky'), h1 = $('#firstHeading');
  function onScroll() {
    if (sticky && h1 && !B.classList.contains('ns-main')) {
      var on = h1.getBoundingClientRect().bottom < 0;
      sticky.classList.toggle('on', on);
      sticky.setAttribute('aria-hidden', String(!on));
    }
    if (heads.length) markActive();
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  }, { passive: true });
  onScroll();

  /* ---------- Search with suggestions ---------- */
  function scoreMatch(p, q) {
    var t = p.t.toLowerCase();
    if (t === q) return 0;
    if (t.indexOf(q) === 0) return 1;
    if (t.indexOf(' ' + q) > -1) return 2;
    if (t.indexOf(q) > -1) return 3;
    return -1;
  }
  function suggest(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var seen = {}, out = [];
    PAGES.map(function (p) { return { p: p, s: scoreMatch(p, q) }; })
      .filter(function (x) { return x.s >= 0 && x.p.k !== 's'; })
      .sort(function (a, b) { return a.s - b.s || a.p.t.length - b.p.t.length; })
      .forEach(function (x) {
        var target = resolve(x.p.t);
        if (!target || seen[target.t]) return;
        seen[target.t] = 1;
        out.push({ shown: x.p.t, page: target });
      });
    return out.slice(0, 8);
  }
  function bold(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<b>' + esc(text.slice(i, i + q.length)) + '</b>' + esc(text.slice(i + q.length));
  }
  $$('.search-form, .special-form').forEach(function (form) {
    var input = form.querySelector('input'), box = form.querySelector('.suggestions'), active = -1;
    form.addEventListener('submit', function (e) {
      var q = input.value.trim();
      if (!q) { e.preventDefault(); return; }
      var hit = resolve(normTitle(q)) || PAGES.filter(function (p) { return p.t.toLowerCase() === q.toLowerCase(); }).map(function (p) { return resolve(p.t); })[0];
      if (box && active >= 0) { e.preventDefault(); var a = box.querySelectorAll('a')[active]; if (a) location.href = a.href; return; }
      if (hit && hit.k !== 's') { e.preventDefault(); location.href = pageUrl(hit.t); }
      else if (form.classList.contains('special-form')) { e.preventDefault(); location.href = '?search=' + encodeURIComponent(q); }
    });
    if (!box) return;
    function render() {
      var q = input.value, list = suggest(q);
      active = -1;
      if (!q.trim()) { box.hidden = true; return; }
      box.innerHTML = list.map(function (s) {
        var img = s.page.i ? ' style="background-image:url(' + ROOT + 'assets/img/' + esc(s.page.i) + ')"' : '';
        var desc = s.page.d || (s.shown !== s.page.t ? 'Redirect to ' + s.page.t : '');
        return '<li><a href="' + pageUrl(s.page.t) + '"><span class="sg-thumb"' + img + '></span><span><span class="sg-title">' +
          bold(s.shown, q.trim()) + '</span><span class="sg-desc">' + esc(desc) + '</span></span></a></li>';
      }).join('') + '<li class="sg-all"><a href="' + ROOT + 'wiki/Special_Search/?search=' + encodeURIComponent(q) +
        '&fulltext=1"><span class="sg-thumb" style="display:flex;align-items:center;justify-content:center;background:none"><svg viewBox="0 0 20 20"><path d="M12.2 13.6a7 7 0 1 1 1.4-1.4l5.4 5.4-1.4 1.4zM3 8a5 5 0 1 0 10 0A5 5 0 0 0 3 8"/></svg></span><span>Search for pages containing <b>' + esc(q) + '</b></span></a></li>';
      box.hidden = false;
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      var items = box.querySelectorAll('li');
      if (box.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length + 1) % (items.length + 1) - (0);
        if (active === items.length) active = -1;
        items.forEach(function (li, i) { li.classList.toggle('active', i === active); });
      }
    });
    D.addEventListener('click', function (e) { if (!form.contains(e.target)) box.hidden = true; });
  });
  var st = $('.search-toggle');
  if (st) st.addEventListener('click', function () {
    var vh = $('.vh'); vh.classList.toggle('search-open');
    if (vh.classList.contains('search-open')) $('.vh-search input').focus();
  });

  /* ---------- Page previews and reference tooltips ---------- */
  var popup = null, timer = null, hideTimer = null, titleStash = null;
  function hidePopup() {
    clearTimeout(timer);
    if (popup) { popup.remove(); popup = null; }
    if (titleStash) { titleStash.el.setAttribute('title', titleStash.t); titleStash = null; }
  }
  function place(el, link) {
    var r = link.getBoundingClientRect();
    var x = r.left + window.scrollX, y = r.bottom + window.scrollY + 8;
    var w = el.offsetWidth, maxX = window.scrollX + D.documentElement.clientWidth - w - 12;
    el.style.left = Math.max(12, Math.min(x, maxX)) + 'px';
    if (r.bottom + el.offsetHeight + 16 > window.innerHeight && r.top > el.offsetHeight + 16) y = r.top + window.scrollY - el.offsetHeight - 8;
    el.style.top = y + 'px';
  }
  function show(link, html) {
    hidePopup();
    popup = D.createElement('div');
    popup.className = 'wp-popup';
    popup.innerHTML = html;
    popup.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    popup.addEventListener('mouseleave', function () { hideTimer = setTimeout(hidePopup, 300); });
    B.appendChild(popup);
    place(popup, link);
  }
  function previewFor(link) {
    var sup = link.closest('sup.reference');
    if (sup) {
      var note = D.getElementById(decodeURIComponent(link.hash.slice(1)));
      var text = note && note.querySelector('.reference-text');
      if (!text) return null;
      return '<div class="pp-body"><div class="pp-head">' + (sup.textContent.match(/[a-z]\]/) ? 'Note' : 'Reference') + '</div>' + text.innerHTML + '</div>';
    }
    if (link.classList.contains('new')) {
      var nt = (link.getAttribute('title') || '').replace(/ \(page does not exist\)$/, '');
      return '<div class="pp-body"><p class="pp-missing">This page does not exist yet. Click to search for <b>' + esc(nt) + '</b> or start it.</p></div>';
    }
    var t = link.getAttribute('data-wp-title');
    var p = t && resolve(t);
    if (!p || !p.x || p.t === B.getAttribute('data-title')) return null;
    var img = p.i ? '<div class="pp-img" style="background-image:url(' + ROOT + 'assets/img/' + esc(p.i) + ')"></div>' : '';
    return img + '<div class="pp-body fade"><p>' + bold(p.x, p.t) + '</p></div>';
  }
  $$('.mw-parser-output a[title]').forEach(function (a) {
    if (a.closest('sup.reference')) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('/wiki/') > -1 && !a.classList.contains('new')) a.setAttribute('data-wp-title', a.getAttribute('title'));
  });
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (canHover) {
    D.addEventListener('mouseover', function (e) {
      var link = e.target.closest && e.target.closest('.mw-parser-output a, .mw-parser-output sup.reference a');
      if (!link || link.closest('.wp-popup') || link.closest('.navbox') || link.closest('.toc')) return;
      if (!link.hasAttribute('data-wp-title') && !link.closest('sup.reference') && !link.classList.contains('new')) return;
      clearTimeout(timer); clearTimeout(hideTimer);
      if (link.hasAttribute('title')) { titleStash = { el: link, t: link.getAttribute('title') }; link.removeAttribute('title'); }
      timer = setTimeout(function () {
        var html = previewFor(link);
        if (html) {
          var keep = titleStash; titleStash = null; show(link, html); titleStash = keep;
        }
      }, link.closest('sup.reference') ? 150 : 450);
    });
    D.addEventListener('mouseout', function (e) {
      var link = e.target.closest && e.target.closest('.mw-parser-output a');
      if (!link) return;
      clearTimeout(timer);
      if (titleStash && titleStash.el === link) { link.setAttribute('title', titleStash.t); titleStash = null; }
      hideTimer = setTimeout(hidePopup, 250);
    });
  }

  /* ---------- Phones: lead paragraph above the infobox, like Wikipedia's mobile site ---------- */
  var ibox = $('.mw-parser-output > .infobox');
  if (ibox && window.matchMedia('(max-width: 719px)').matches) {
    var n = ibox.nextElementSibling;
    while (n && n.tagName !== 'P') n = n.nextElementSibling;
    if (n) ibox.parentNode.insertBefore(n, ibox);
  }

  /* ---------- Navboxes ---------- */
  $$('.navbox').forEach(function (nb) {
    var t = nb.querySelector('.navbox-title');
    if (!t) return;
    var b = D.createElement('button');
    b.className = 'navbox-toggle';
    b.textContent = nb.classList.contains('collapsed') ? '[show]' : '[hide]';
    b.addEventListener('click', function () {
      nb.classList.toggle('collapsed');
      b.textContent = nb.classList.contains('collapsed') ? '[show]' : '[hide]';
    });
    t.appendChild(b);
  });

  /* ---------- Image lightbox ---------- */
  var lb = null;
  function closeLightbox() { if (lb) { lb.remove(); lb = null; } }
  D.addEventListener('click', function (e) {
    var img = e.target.closest('figure.thumb img, .infobox img, .gallery img');
    if (!img) return;
    var link = img.closest('a');
    if (link && link.getAttribute('href') && link.getAttribute('href').indexOf('/wiki/') > -1) return;
    e.preventDefault();
    var fig = img.closest('figure, li, td');
    var cap = fig && fig.querySelector('figcaption, p, .caption');
    lb = D.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button aria-label="Close">&times;</button><img src="' + img.currentSrc + '" alt="' + esc(img.alt) + '">' + '<p>' + (cap ? cap.innerHTML : '') + (img.getAttribute('data-credit') ? '<br><small style="opacity:.75">' + esc(img.getAttribute('data-credit')) + '</small>' : '') + '</p>';
    lb.addEventListener('click', function (ev) { if (ev.target === lb || ev.target.tagName === 'BUTTON') closeLightbox(); });
    B.appendChild(lb);
  });

  /* ---------- Tools menu actions ---------- */
  D.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action]');
    if (!a) return;
    e.preventDefault();
    closeAll();
    var act = a.getAttribute('data-action'), title = B.getAttribute('data-title');
    if (act === 'print') window.print();
    if (act === 'copy' && navigator.clipboard) navigator.clipboard.writeText(location.href.split('?')[0]);
    if (act === 'cite') {
      var d = new Date().toISOString().slice(0, 10);
      window.prompt('Cite this page (copy):', '"' + title + '". 40,000 Wiki. Retrieved ' + d + '. ' + location.href.split('?')[0]);
    }
  });

  /* ---------- Redirect notice ---------- */
  var from = param('redirectedfrom');
  if (from && $('#contentSub')) {
    $('#contentSub').innerHTML = '(Redirected from ' + esc(from) + ')';
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  }

  /* ---------- Special pages ---------- */
  var sp = $('#special');
  if (sp) {
    var kind = sp.getAttribute('data-special');
    var h = $('#firstHeading .mw-page-title-main');
    if (kind === 'random') {
      var list = articles().filter(function (p) { return p.t !== 'Main Page'; });
      var pick = list[Math.floor(Math.random() * list.length)];
      if (pick) location.replace(pageUrl(pick.t));
    }
    if (kind === 'missing') {
      var mt = normTitle(param('title') || '');
      D.title = mt + ' - 40,000 Wiki';
      $$('#firstHeading .mw-page-title-main, .sticky-title').forEach(function (el) { el.textContent = mt; });
      $('#firstHeading').innerHTML = '<span class="mw-page-title-main">' + esc(mt) + '</span>';
      var linkers = PAGES.filter(function (p) { return (p.l || []).indexOf(mt) > -1; });
      var file = encodeURIComponent(slug(mt) + '.html');
      sp.innerHTML = '<div class="ambox"><div><b>40,000 Wiki does not have an article with this exact name.</b> Please <a href="' + ROOT +
        'wiki/Special_Search/?search=' + encodeURIComponent(mt) + '">search for <i>' + esc(mt) + '</i> in 40,000 Wiki</a> to check for alternative titles or spellings.</div></div>' +
        '<ul><li><a href="https://github.com/martin-k-m/warpedia/new/main/src/articles?filename=' + file + '">Start the <b>' + esc(mt) + '</b> article</a> on GitHub, or ask Claude to write it.</li>' +
        '<li>Look for pages within 40,000 Wiki that <a href="' + ROOT + 'wiki/Special_WhatLinksHere/?target=' + encodeURIComponent(mt) + '">link to this title</a>' +
        (linkers.length ? ' (' + linkers.length + ' page' + (linkers.length > 1 ? 's' : '') + ' already do).' : '.') + '</li>' +
        '<li>Read about it elsewhere: <a href="https://wh40k.lexicanum.com/wiki/' + encodeURIComponent(slug(mt)) + '">Lexicanum</a> · <a href="https://warhammer40k.fandom.com/wiki/' + encodeURIComponent(slug(mt)) + '">Fandom</a></li></ul>';
    }
    if (kind === 'whatlinkshere') {
      var target = normTitle(param('target') || '');
      var res = PAGES.filter(function (p) { return (p.l || []).indexOf(target) > -1 && p.t !== target; });
      var redirs = PAGES.filter(function (p) { return p.k === 'r' && p.r === target; });
      sp.innerHTML = '<form class="special-form" onsubmit="location.search=\'?target=\'+encodeURIComponent(this.t.value);return false"><input name="t" value="' + esc(target) + '" aria-label="Page"><button>Go</button></form>' +
        (target ? '<p>The following pages link to <a href="' + pageUrl(target) + '">' + esc(target) + '</a>:</p>' +
          (res.length || redirs.length ? '<ul>' + redirs.map(function (r) { return '<li><a href="' + pageUrl(r.t) + '">' + esc(r.t) + '</a> (redirect page)</li>'; }).join('') +
            res.map(function (p) { return '<li><a href="' + pageUrl(p.t) + '">' + esc(p.t) + '</a></li>'; }).join('') + '</ul>' : '<p>No pages link to ' + esc(target) + '.</p>') : '');
    }
    if (kind === 'allpages') {
      var all = PAGES.filter(function (p) { return p.k === 'a' || p.k === 'r' || p.k === 'm'; }).sort(function (a, b) { return a.t.localeCompare(b.t); });
      var cats = PAGES.filter(function (p) { return p.k === 'c'; }).sort(function (a, b) { return a.t.localeCompare(b.t); });
      sp.innerHTML = '<p>40,000 Wiki has <b>' + articles().length + '</b> articles. Redirects are shown in <i>italics</i>.</p><ul class="allpages">' +
        all.map(function (p) { return '<li class="' + (p.k === 'r' ? 'redir' : '') + '"><a href="' + pageUrl(p.k === 'r' ? p.r : p.t) + '">' + esc(p.t) + '</a></li>'; }).join('') +
        '</ul><h2 style="margin-top:1.2em">Categories</h2><ul class="allpages">' + cats.map(function (p) { return '<li><a href="' + pageUrl(p.t) + '">' + esc(p.t.slice(9)) + '</a></li>'; }).join('') + '</ul>' +
        '<h2 style="margin-top:1.2em">Wanted pages</h2><p>Red links that no article fills yet, most linked first.</p><ol class="allpages" style="list-style:decimal;padding-left:2em">' + wanted() + '</ol>';
    }
    if (kind === 'search') {
      var q = param('search') || '';
      var form = sp.querySelector('input');
      if (form) form.value = q;
      if (q) {
        var exact = resolve(normTitle(q));
        if (exact && !param('fulltext')) { location.replace(pageUrl(exact.t)); return; }
        var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        var results = PAGES.filter(function (p) { return p.k === 'a' || p.k === 'c' || p.k === 'm'; }).map(function (p) {
          var hay = (p.t + ' ' + (p.d || '') + ' ' + (p.b || '')).toLowerCase(), score = 0;
          for (var i = 0; i < terms.length; i++) {
            var c = hay.split(terms[i]).length - 1;
            if (!c) return null;
            score += c + (p.t.toLowerCase().indexOf(terms[i]) > -1 ? 50 : 0);
          }
          return { p: p, s: score };
        }).filter(Boolean).sort(function (a, b) { return b.s - a.s; });
        var out = '';
        if (!exact) out += '<p class="mw-search-exists">Create the page "<a class="new" href="' + ROOT + 'wiki/Special_Missing/?title=' + encodeURIComponent(normTitle(q)) + '">' + esc(normTitle(q)) + '</a>" on this wiki!</p>';
        else out += '<p class="mw-search-exists">There is a page named "<a href="' + pageUrl(exact.t) + '">' + esc(exact.t) + '</a>" on this wiki.</p>';
        out += '<p class="sr-meta">Results 1 – ' + results.length + ' of ' + results.length + '</p><ul class="search-results">' + results.map(function (r) {
          var body = r.p.b || r.p.x || '', lower = body.toLowerCase(), at = lower.indexOf(terms[0]);
          var start = Math.max(0, at - 90), snip = body.slice(start, start + 260);
          var html = esc(snip);
          terms.forEach(function (t) { html = html.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<span class="searchmatch">$1</span>'); });
          var words = body.split(/\s+/).length;
          return '<li><div class="sr-title"><a href="' + pageUrl(r.p.t) + '">' + esc(r.p.t) + '</a></div><div class="sr-snip">' + (start ? '… ' : '') + html + ' …</div><div class="sr-meta">' + words.toLocaleString() + ' words</div></li>';
        }).join('') + '</ul>';
        if (!results.length) out += '<p>There were no results matching the query.</p>';
        sp.querySelector('.results').innerHTML = out;
      }
    }
  }
  function wanted() {
    var have = {}, counts = {};
    PAGES.forEach(function (p) { have[p.t] = 1; });
    PAGES.forEach(function (p) { (p.l || []).forEach(function (l) { if (!have[l]) counts[l] = (counts[l] || 0) + 1; }); });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).map(function (t) {
      return '<li><a class="new" href="' + ROOT + 'wiki/Special_Missing/?title=' + encodeURIComponent(t) + '">' + esc(t) + '</a> (' + counts[t] + ' link' + (counts[t] > 1 ? 's' : '') + ')</li>';
    }).join('');
  }
})();
