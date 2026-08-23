/* Watanabe3ti Atlas — Command Palette (⌘K / Ctrl+K)
   全ページ共通。道具・ページ・外部拠点を横断検索して即移動。 */
(() => {
  "use strict";

  /* 現在ページの深さから相対ベースパスを算出 */
  const segs = location.pathname.split("/").filter(Boolean);
  const last = segs[segs.length - 1] || "";
  const dirCount = /\.html?$/.test(last) ? segs.length - 1 : segs.length;
  const BASE = "../".repeat(Math.max(0, dirCount - 1));

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  /* ---------- 静的インデックス ---------- */
  const staticItems = [
    { group: "PAGE", label: "HOME — Atlas ホーム", hint: "入口・注目・世界", href: BASE + "index.html" },
    { group: "PAGE", label: "Works — 道具の地図", hint: "一覧 検索 タグ", href: BASE + "works/index.html" },
    { group: "PAGE", label: "Works · Tools — ツール", hint: "tool", href: BASE + "works/index.html?type=tool" },
    { group: "PAGE", label: "Works · Experiments — 実験", hint: "experiment lab", href: BASE + "works/index.html?type=experiment" },
    { group: "PAGE", label: "Works · Writing — ノート", hint: "writing blog docs", href: BASE + "works/index.html?type=writing" },
    { group: "PAGE", label: "Now — 現在地", hint: "いま 作っている", href: BASE + "now/index.html" },
    { group: "PAGE", label: "Updates — 更新履歴", hint: "release changelog 再訪", href: BASE + "updates/index.html" },
    { group: "COMMAND", label: "Enter the OS — Atlas OS 体験", hint: "デスクトップ classic", href: BASE + "os/index.html" },
    { group: "WORLD", label: "main — Classic OS", hint: "Mac OS 9 デスクトップ", href: "https://watanabe3ti.com/" },
    { group: "WORLD", label: "neo — Digital Tunnel", hint: "バイナリ トンネル", href: "https://watanabe3ti.com/neo/" },
    { group: "WORLD", label: "next — Mission Control", hint: "Takeoff to Wonder 宇宙", href: "https://watanabe3ti.com/next/" },
    { group: "HUB", label: "GitHub", hint: "コード リポジトリ", href: "https://github.com/watanabe3tipapa/" },
    { group: "HUB", label: "BLOG", hint: "長文 発信", href: "https://watanabe3ti.txt-nifty.com/" },
    { group: "HUB", label: "LOG", hint: "日々 ログ", href: "https://log.watanabe3ti.com/" },
    { group: "HUB", label: "Wiki", hint: "知識 整理", href: "https://wiki.watanabe3ti.com/" },
    { group: "HUB", label: "Toolsmith", hint: "道具箱 ニュース tool", href: "https://toolsmith.watanabe3ti.com/" },
    { group: "HUB", label: "Toolsmith NEWS", hint: "更新情報 news", href: "https://toolsmith.watanabe3ti.com/news/" }
  ];

  /* ---------- 道具インデックス（遅延ロード） ---------- */
  let workItems = [];
  let worksLoaded = false;
  async function loadWorks() {
    if (worksLoaded) return;
    try {
      const files = ["data/works-tools.json", "data/works-lab.json"].map((f) => BASE + f);
      const results = await Promise.all(files.map((f) => fetch(f).then((r) => r.json())));
      workItems = results.flatMap((r) => r.works).map((w) => ({
        group: `WORK · ${w.type}`,
        label: w.name,
        hint: [w.lang, ...w.tags].filter(Boolean).join(" · "),
        tags: w.tags.join(" ").toLowerCase(),
        summary: w.summaryJa,
        href: BASE + `works/work.html?slug=${encodeURIComponent(w.slug)}`
      }));
      worksLoaded = true;
    } catch {
      workItems = [];
    }
  }

  /* ---------- UI ---------- */
  const launch = document.createElement("button");
  launch.className = "palette-launch";
  launch.type = "button";
  launch.setAttribute("aria-haspopup", "dialog");
  launch.setAttribute("aria-label", "検索を開く (Command K または /)");
  launch.innerHTML =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="palette-launch__text">検索</span><span class="mono">⌘K</span>';
  document.body.appendChild(launch);

  const overlay = document.createElement("div");
  overlay.className = "palette-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="palette" role="dialog" aria-modal="true" aria-label="コマンドパレット">
      <div class="palette__head">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="palette-input" type="text" placeholder="道具・ページ・拠点を検索… (try: ollama, neo)" autocomplete="off" spellcheck="false">
        <kbd class="mono">ESC</kbd>
      </div>
      <ul class="palette__list" id="palette-list" role="listbox"></ul>
      <p class="palette__foot mono">↑↓ 移動 · ↵ 開く · ESC 閉じる · ⌘K or / で呼び出し</p>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("#palette-input");
  const listEl = overlay.querySelector("#palette-list");
  let results = [];
  let active = 0;
  let lastFocus = null;

  function openPalette() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    loadWorks().then(render);
    input.value = "";
    render();
    input.focus();
  }

  function closePalette() {
    overlay.hidden = true;
    launch.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function filter(q) {
    const all = staticItems.concat(workItems);
    if (!q) return all.slice(0, 14);
    const tokens = q.toLowerCase().split(/\s+/);
    return all
      .map((it) => {
        const hay = [it.label, it.hint || "", it.tags || "", it.summary || ""]
          .join(" ")
          .toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
        return { it, score };
      })
      .filter((r) => r.score === tokens.length)
      .sort((a, b) => {
        const la = a.it.label.toLowerCase(), lb = b.it.label.toLowerCase();
        const ta = tokens.some((t) => la.startsWith(t)) ? 0 : 1;
        const tb = tokens.some((t) => lb.startsWith(t)) ? 0 : 1;
        return tb - ta || b.score - a.score;
      })
      .slice(0, 14)
      .map((r) => r.it);
  }

  function render() {
    results = filter(input.value.trim());
    active = Math.min(active, Math.max(0, results.length - 1));
    if (!results.length) {
      listEl.innerHTML = '<li class="palette__empty">該当なし — try “ollama”, “works”, “next”</li>';
      return;
    }
    listEl.innerHTML = results
      .map(
        (it, i) => `
      <li role="option" aria-selected="${i === active}" class="${i === active ? "is-active" : ""}" data-i="${i}">
        <span class="palette__group mono">${esc(it.group)}</span>
        <span class="palette__label">${esc(it.label)}</span>
        <span class="palette__hint">${esc(it.hint || "")}</span>
      </li>`
      )
      .join("");
  }

  function go(it) {
    closePalette();
    if (/^https?:/.test(it.href)) {
      window.open(it.href, "_blank", "noopener");
    } else {
      location.href = it.href;
    }
  }

  launch.addEventListener("click", openPalette);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
  });
  listEl.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) go(results[Number(li.dataset.i)]);
  });
  listEl.addEventListener("mousemove", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li && Number(li.dataset.i) !== active) {
      active = Number(li.dataset.i);
      render();
    }
  });
  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(active + 1, results.length - 1);
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active]);
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.hidden ? openPalette() : closePalette();
    } else if (e.key === "Escape" && !overlay.hidden) {
      closePalette();
    } else if (e.key === "/" && overlay.hidden) {
      const t = e.target;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (!typing) {
        e.preventDefault();
        openPalette();
      }
    }
  });
})();
