/* Watanabe3ti Atlas OS — Mac OS 9 風デスクトップ体験
   Atlas と同じ道具データ（data/works-*.json）を読む統合ビュー。 */
(() => {
  "use strict";

  const BASE = "../";
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  /* ---------- データ ---------- */
  async function loadData() {
    const files = ["data/works-tools.json", "data/works-lab.json"].map((f) => BASE + f);
    const results = await Promise.all(files.map((f) => fetch(f).then((r) => r.json())));
    const works = results.flatMap((r) => r.works);
    return {
      tools: works.filter((w) => w.type === "TOOL"),
      lab: works.filter((w) => w.type === "EXPERIMENT"),
      notes: works.filter((w) => w.type === "WRITING")
    };
  }

  const LINKS = [
    { name: "GitHub", desc: "コードと実験のリポジトリ", url: "https://github.com/watanabe3tipapa/" },
    { name: "BLOG", desc: "思考と記録の長文発信", url: "https://watanabe3ti.txt-nifty.com/" },
    { name: "LOG", desc: "日々のログ", url: "https://log.watanabe3ti.com/" },
    { name: "Wiki", desc: "知識とメモの整理場所", url: "https://wiki.watanabe3ti.com/" },
    { name: "Toolsmith", desc: "道具箱とテクノロジーニュース", url: "https://toolsmith.watanabe3ti.com/" },
    { name: "Toolsmith NEWS", desc: "更新情報", url: "https://toolsmith.watanabe3ti.com/news/" }
  ];

  const fileRow = (w) => `
    <a class="file-row" href="${BASE}works/work.html?slug=${encodeURIComponent(w.slug)}">
      <span class="file-row__name">${esc(w.name)}</span>
      <span class="file-row__meta mono">${esc(w.type)} · ${esc(w.status)} · ${esc(w.lang || "")}</span>
    </a>`;

  const linkRow = (l) => `
    <a class="file-row" href="${esc(l.url)}" target="_blank" rel="noopener">
      <span class="file-row__name">${esc(l.name)}<span aria-hidden="true"> ↗</span></span>
      <span class="file-row__meta mono">ALIAS</span>
    </a>`;

  const startBody = () => `
    <p class="win__lead">Watanabe3ti Atlas OS へようこそ。ここは <strong>Atlas と同じ道具データ</strong>を、デスクトップのメタファーで読む体験モードです。</p>
    <ul class="win__menu">
      <li><a href="${BASE}index.html">Atlas ホームを見る</a></li>
      <li><a href="${BASE}works/index.html">Works 一覧を開く</a></li>
      <li><a href="${BASE}now/index.html">Now — 現在地</a></li>
      <li><a href="https://watanabe3ti.com/" target="_blank" rel="noopener">本家 main（Classic OS）へ ↗</a></li>
      <li><a href="https://watanabe3ti.com/next/" target="_blank" rel="noopener">Takeoff to Wonder（next）へ ↗</a></li>
    </ul>
    <p class="win__note mono">TIP: ⌘K で Command Palette が開きます。</p>`;

  const readmeBody = () => `
    <p class="win__lead">この画面は watanabe3ti.com 本体（main）の OS 体験へのオマージュとして、Atlas 側に用意した軽量な再解釈です。</p>
    <ul class="plainlist">
      <li>フォルダの中身は <span class="mono">data/works-*.json</span> から生成されています。Atlas UI と OS UI は同じ正本データを読んでいます。</li>
      <li>ファイルをクリックすると、Atlas の道具詳細ページが開きます。</li>
      <li>画面幅が狭いときは Compact Mode（一覧表示）になります。メニューバーからいつでも切替できます。</li>
      <li>起動演出は意図的に省略しています。急ぐ人のための OS です。</li>
    </ul>`;

  /* ---------- ウィンドウマネージャ ---------- */
  const winsRoot = document.getElementById("windows");
  const templates = {
    start: { title: "Start Here", body: startBody },
    apps: { title: "Applications — Tools", body: null },
    lab: { title: "Experiments", body: null },
    notes: { title: "Documents — Notes", body: null },
    readme: { title: "Readme", body: readmeBody },
    links: { title: "Links", body: null }
  };

  let topZ = 10;
  let cascade = 0;
  let focused = null;

  function openWin(id, data) {
    const existing = winsRoot.querySelector(`[data-win="${id}"]`);
    if (existing) return focusWin(existing);

    const tpl = templates[id];
    let bodyHtml;
    if (id === "apps") bodyHtml = data.tools.map(fileRow).join("");
    else if (id === "lab") bodyHtml = data.lab.map(fileRow).join("");
    else if (id === "notes") bodyHtml = data.notes.map(fileRow).join("");
    else if (id === "links") bodyHtml = LINKS.map(linkRow).join("");
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
    try { localStorage.setItem("atlas-os-mode", mode); } catch {}
  }

  function initMode() {
    let saved = null;
    try { saved = localStorage.getItem("atlas-os-mode"); } catch {}
    applyMode(saved || (mq.matches ? "compact" : "desktop"));
  }

  toggleBtn.addEventListener("click", () =>
    applyMode(document.body.classList.contains("os-compact") ? "desktop" : "compact")
  );
  mq.addEventListener?.("change", () => {
    let saved = null;
    try { saved = localStorage.getItem("atlas-os-mode"); } catch {}
    if (!saved) applyMode(mq.matches ? "compact" : "desktop");
  });

  function renderCompact(data) {
    compactRoot.innerHTML = `
      <div class="compact__intro">
        <p class="mono compact__label">WATANABE3TI ATLAS OS — COMPACT MODE</p>
        <p>同じ道具データを、小さな画面向けの一覧で。アイコン操作は不要です。</p>
        <p class="mono"><button type="button" class="chip" onclick="document.getElementById('mode-toggle').click()">Desktop View へ</button></p>
      </div>
      ${[
        ["Applications — Tools", data.tools],
        ["Experiments", data.lab],
        ["Documents — Notes", data.notes]
      ].map(([title, arr]) => `
        <section class="compact__sec">
          <h2 class="compact__title">${esc(title)}</h2>
          ${arr.map(fileRow).join("")}
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
