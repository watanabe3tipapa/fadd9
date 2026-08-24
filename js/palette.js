/* Watanabe3ti fadd9 — Command Palette (⌘K / Ctrl+K)
   全ページ共通。譜例・ページ・外部拠点を横断検索して即移動。 */
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
    { group: "PAGE", label: "HOME — fadd9 ホーム", hint: "ABC記法 ギター 譜例", href: BASE + "index.html" },
    { group: "PAGE", label: "Samples — 譜例ライブラリ", hint: "一覧 検索 カテゴリ", href: BASE + "samples/index.html" },
    { group: "PAGE", label: "Samples · Exercise — 練習", hint: "ウォームアップ 指練習", href: BASE + "samples/index.html?category=exercise" },
    { group: "PAGE", label: "Samples · Chords — コード進行", hint: "王道 カノン ダイアトニック", href: BASE + "samples/index.html?category=chords" },
    { group: "PAGE", label: "Samples · Scales — スケール", hint: "メジャー ペンタトニック", href: BASE + "samples/index.html?category=scales" },
    { group: "PAGE", label: "Samples · Riffs — リフ", hint: "ブルーズ ロック シャッフル", href: BASE + "samples/index.html?category=riffs" },
    { group: "PAGE", label: "Samples · Songs — 曲", hint: "パブリックドメイン メロディ", href: BASE + "samples/index.html?category=songs" },
    { group: "PAGE", label: "Roadmap — これから", hint: "phase 計画 library", href: BASE + "index.html#roadmap" },
    { group: "PAGE", label: "Reference — ABC記法チートシート", hint: "文法 早見表 記号", href: BASE + "reference/index.html" },
    { group: "PAGE", label: "Playground — 書いて即再生", hint: "エディタ 入力 描画", href: BASE + "playground/index.html" },
    { group: "PAGE", label: "Now — 練習の現在地", hint: "いま 練習している", href: BASE + "now/index.html" },
    { group: "PAGE", label: "Updates — 更新履歴", hint: "release changelog 再訪", href: BASE + "updates/index.html" },
    { group: "COMMAND", label: "Enter the OS — Fadd9 OS 体験", hint: "デスクトップ classic", href: BASE + "os/index.html" },
    { group: "COMMAND", label: "RSS — feed.xml", hint: "atom 更新 購読", href: BASE + "feed.xml" },
    { group: "HUB", label: "GitHub", hint: "コード リポジトリ", href: "https://github.com/watanabe3tipapa/" },
    { group: "HUB", label: "BLOG", hint: "長文 発信", href: "https://watanabe3ti.txt-nifty.com/" },
    { group: "HUB", label: "LOG", hint: "日々 ログ", href: "https://log.watanabe3ti.com/" },
    { group: "HUB", label: "Wiki", hint: "知識 整理", href: "https://wiki.watanabe3ti.com/" },
    { group: "HUB", label: "Toolsmith", hint: "道具箱 ニュース tool", href: "https://toolsmith.watanabe3ti.com/" }
  ];

  /* ---------- 譜例インデックス(遅延ロード) ---------- */
  let sampleItems = [];
  let samplesLoaded = false;
  async function loadSamples() {
    if (samplesLoaded) return;
    try {
      const r = await fetch(BASE + "data/samples.json").then((r) => r.json());
      sampleItems = r.samples.map((s) => ({
        group: `SAMPLE · ${s.category}`,
        label: s.name,
        hint: [s.nameJa, `KEY ${s.key}`, ...s.tags].join(" · "),
        tags: [...s.tags, s.category, s.key].join(" ").toLowerCase(),
        summary: s.summaryJa,
        href: BASE + `samples/sample.html?slug=${encodeURIComponent(s.slug)}`
      }));
      samplesLoaded = true;
    } catch {
      sampleItems = [];
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
        <input id="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" placeholder="ページ・譜例・拠点を検索… (try: fadd9, study)" autocomplete="off" spellcheck="false">
        <kbd class="mono">ESC</kbd>
      </div>
      <ul class="palette__list" id="palette-list" role="listbox" aria-label="検索結果"></ul>
      <p class="palette__empty mono" id="palette-empty" role="status" hidden>該当なし — try “fadd9”, “samples”, “abc”</p>
      <p class="palette__foot mono">↑↓ 移動 · ↵ 開く · ESC 閉じる · ⌘K or / で呼び出し</p>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("#palette-input");
  const listEl = overlay.querySelector("#palette-list");
  const emptyEl = overlay.querySelector("#palette-empty");
  let results = [];
  let active = 0;
  let lastFocus = null;

  function openPalette() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    loadSamples().then(render);
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
    const all = staticItems.concat(sampleItems);
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
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    emptyEl.hidden = true;
    listEl.innerHTML = results
      .map(
        (it, i) => `
      <li role="option" id="palette-opt-${i}" aria-selected="${i === active}" class="${i === active ? "is-active" : ""}" data-i="${i}">
        <span class="palette__group mono">${esc(it.group)}</span>
        <span class="palette__label">${esc(it.label)}</span>
        <span class="palette__hint">${esc(it.hint || "")}</span>
      </li>`
      )
      .join("");
    input.setAttribute("aria-activedescendant", `palette-opt-${active}`);
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
