/* FADD9 OS — Mac OS 9 風デスクトップ体験
   data/samples.json を正本に、譜例をフォルダとして眺める統合ビュー。 */
(() => {
  "use strict";

  const BASE = "../";
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const CATEGORIES = ["exercise", "chords", "scales", "riffs", "songs"];
  const CATEGORY_TITLE = {
    exercise: "Exercises — 練習",
    chords: "Chords — コード進行",
    scales: "Scales — スケール",
    riffs: "Riffs — リフ",
    songs: "Songs — 曲"
  };

  /* ---------- データ ---------- */
  async function loadData() {
    const res = await fetch(BASE + "data/samples.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const samples = (await res.json()).samples;
    return { samples,
             ...Object.fromEntries(CATEGORIES.map((c) => [c, samples.filter((s) => s.category === c)])) };
  }

  const LINKS = [
    { name: "Samples 一覧", desc: "譜例ライブラリ(検索・絞り込み)", url: BASE + "samples/index.html" },
    { name: "Playground", desc: "書いてすぐ鳴るエディタ", url: BASE + "playground/index.html" },
    { name: "Reference", desc: "ABC記法チートシート", url: BASE + "reference/index.html" },
    { name: "GitHub", desc: "コードと実験のリポジトリ", url: "https://github.com/watanabe3tipapa/", ext: true },
    { name: "BLOG", desc: "思考と記録の長文発信", url: "https://watanabe3ti.txt-nifty.com/", ext: true },
    { name: "LOG", desc: "日々のログ", url: "https://log.watanabe3ti.com/", ext: true }
  ];

  const fileRow = (s) => `
    <a class="file-row" href="${BASE}samples/sample.html?slug=${encodeURIComponent(s.slug)}">
      <span class="file-row__name">${esc(s.name)}</span>
      <span class="file-row__meta mono">${esc(s.level)} · KEY ${esc(s.key)} · ${esc(s.meter)}</span>
    </a>`;

  const linkRow = (l) => `
    <a class="file-row" href="${esc(l.url)}"${l.ext ? ' target="_blank" rel="noopener"' : ""}>
      <span class="file-row__name">${esc(l.name)}${l.ext ? '<span aria-hidden="true"> ↗</span>' : ""}</span>
      <span class="file-row__meta mono">ALIAS</span>
    </a>`;

  const startBody = () => `
    <p class="win__lead"><strong>FADD9 OS</strong> へようこそ。ここは <strong>譜例ライブラリと同じデータ</strong>を、デスクトップのメタファーで読む体験モードです。ギターを持ってから開いてください。</p>
    <ul class="win__menu">
      <li><a href="${BASE}index.html">fadd9 ホームを見る</a></li>
      <li><a href="${BASE}samples/index.html">Samples 一覧を開く</a></li>
      <li><a href="${BASE}playground/index.html">Playground — 書いて即再生</a></li>
      <li><a href="${BASE}reference/index.html">Reference — ABC記法早見表</a></li>
    </ul>
    <p class="win__note mono">TIP: ⌘K で Command Palette が開きます。</p>`;

  const readmeBody = () => `
    <p class="win__lead">この画面は fadd9 の譜例データを別の角度から眺めるための「練習室」です。</p>
    <ul class="plainlist">
      <li>フォルダの中身は <span class="mono">data/samples.json</span> から生成されています。Samples UI も OS UI も同じ正本を読んでいます。</li>
      <li>ファイル行をクリックすると、楽譜の描画と再生ができる詳細ページが開きます。</li>
      <li>画面幅が狭いときは Compact Mode(一覧表示)になります。メニューバーから切替できます。</li>
      <li>起動演出は意図的に省略しています。急ぐ人のための OS です。</li>
    </ul>`;

  /* ---------- ウィンドウマネージャ ---------- */
  const winsRoot = document.getElementById("windows");
  const templates = {
    start: { title: "Start Here", body: startBody },
    readme: { title: "Readme", body: readmeBody },
    links: { title: "Links", body: null },
    ...Object.fromEntries(CATEGORIES.map((c) => [c, { title: CATEGORY_TITLE[c], body: null }]))
  };

  let topZ = 10;
  let cascade = 0;
  let focused = null;

  function openWin(id, data) {
    const existing = winsRoot.querySelector(`[data-win="${id}"]`);
    if (existing) return focusWin(existing);

    const tpl = templates[id];
    let bodyHtml;
    if (CATEGORIES.includes(id)) {
      bodyHtml = (data[id] || []).map(fileRow).join("") ||
        '<p class="win__note mono">このカテゴリはまだ空です。</p>';
    } else if (id === "links") bodyHtml = LINKS.map(linkRow).join("");
    else bodyHtml = tpl.body();

    const win = document.createElement("section");
    win.className = "win";
    win.dataset.win = id;
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", tpl.title);
    win.innerHTML = `
      <header class="win__bar">
        <span class="win__stripes" aria-hidden="true"></span>
        <h2 class="win__title">${esc(tpl.title)}</h2>
        <button type="button" class="win__close" aria-label="${esc(tpl.title)} を閉じる">×</button>
      </header>
      <div class="win__body">${bodyHtml}</div>`;
    winsRoot.appendChild(win);

    const w = Math.min(win.offsetWidth || 420, innerWidth - 32);
    win.style.left = Math.max(12, 90 + cascade * 26) + "px";
    win.style.top = Math.max(56, 74 + cascade * 22) + "px";
    win.style.width = w + "px";
    cascade = (cascade + 1) % 6;

    win.addEventListener("pointerdown", () => focusWin(win));
    win.querySelector(".win__close").addEventListener("click", () => win.remove());
    dragify(win.querySelector(".win__bar"), win);
    focusWin(win);
  }

  function focusWin(win) {
    if (focused) focused.classList.remove("is-focused");
    focused = win;
    win.classList.add("is-focused");
    win.style.zIndex = ++topZ;
  }

  function dragify(bar, win) {
    let sx = 0, sy = 0, ox = 0, oy = 0;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win__close")) return;
      e.preventDefault();
      bar.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(win.style.left, 10); oy = parseInt(win.style.top, 10);
      const move = (ev) => {
        win.style.left = Math.max(-40, ox + ev.clientX - sx) + "px";
        win.style.top = Math.max(34, oy + ev.clientY - sy) + "px";
      };
      const up = (ev) => {
        bar.releasePointerCapture(ev.pointerId);
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const pal = document.querySelector(".palette-overlay");
    if (pal && !pal.hidden) return;
    if (focused) {
      focused.remove();
      focused = null;
    }
  });

  /* ---------- Compact Mode ---------- */
  const compactRoot = document.getElementById("compact-root");
  const toggleBtn = document.getElementById("mode-toggle");
  const mq = matchMedia("(max-width: 719px)");

  function applyMode(mode) {
    const compact = mode === "compact";
    document.body.classList.toggle("os-compact", compact);
    compactRoot.hidden = !compact;
    toggleBtn.textContent = compact ? "Desktop View" : "Compact";
    try { localStorage.setItem("fadd9-os-mode", mode); } catch {}
  }

  function initMode() {
    let saved = null;
    try { saved = localStorage.getItem("fadd9-os-mode"); } catch {}
    applyMode(saved || (mq.matches ? "compact" : "desktop"));
  }

  toggleBtn.addEventListener("click", () =>
    applyMode(document.body.classList.contains("os-compact") ? "desktop" : "compact")
  );
  mq.addEventListener?.("change", () => {
    let saved = null;
    try { saved = localStorage.getItem("fadd9-os-mode"); } catch {}
    if (!saved) applyMode(mq.matches ? "compact" : "desktop");
  });

  function renderCompact(data) {
    compactRoot.innerHTML = `
      <div class="compact__intro">
        <p class="mono compact__label">FADD9 OS — COMPACT MODE</p>
        <p>同じ譜例データを、小さな画面向けの一覧で。アイコン操作は不要です。</p>
        <p class="mono"><button type="button" class="chip" onclick="document.getElementById('mode-toggle').click()">Desktop View へ</button></p>
      </div>
      ${CATEGORIES.map((c) => `
        <section class="compact__sec">
          <h2 class="compact__title">${esc(CATEGORY_TITLE[c])}</h2>
          ${(data[c] || []).map(fileRow).join("")}
        </section>`).join("")}
      <section class="compact__sec">
        <h2 class="compact__title">Links</h2>
        ${LINKS.map(linkRow).join("")}
      </section>`;
  }

  /* ---------- 時計 ---------- */
  const clock = document.getElementById("os-clock");
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit", minute: "2-digit"
    });
  };

  /* ---------- 起動 ---------- */
  document.querySelectorAll(".desk-icon").forEach((btn) =>
    btn.addEventListener("click", () => openWin(btn.dataset.win, currentData))
  );

  let currentData = null;
  loadData()
    .then((data) => {
      currentData = data;
      renderCompact(data);
      if (!document.body.classList.contains("os-compact")) openWin("start", data);
      tick();
      setInterval(tick, 30000);
    })
    .catch(() => {
      winsRoot.innerHTML =
        '<p class="works-error">データの読み込みに失敗しました。<a class="textlink" href="' + BASE + 'index.html">HOME</a> へ戻るか、<a class="textlink" href="https://github.com/watanabe3tipapa/">GitHub</a> をご覧ください。</p>';
    });

  initMode();
})();
