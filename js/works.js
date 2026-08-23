(() => {
  "use strict";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const DATA_FILES = ["../data/works-tools.json", "../data/works-lab.json"];

  async function loadWorks() {
    const results = await Promise.all(
      DATA_FILES.map((f) => fetch(f).then((r) => r.json()))
    );
    return results.flatMap((r) => r.works);
  }

  const TYPE_LABEL = { TOOL: "ツール", EXPERIMENT: "実験", WRITING: "ノート" };
  const STATUS_LABEL = { ACTIVE: "ACTIVE", WIP: "WIP", PROTOTYPE: "PROTOTYPE" };

  function badgeClass(type) {
    return { TOOL: "badge--tool", EXPERIMENT: "badge--exp", WRITING: "badge--writing" }[type] || "";
  }

  /* ---------- 一覧ページ ---------- */
  async function initIndex() {
    const grid = document.getElementById("works-grid");
    if (!grid) return;
    let works;
    try {
      works = await loadWorks();
    } catch {
      grid.innerHTML =
        '<p class="works-error">データの読み込みに失敗しました。<a class="textlink" href="https://github.com/watanabe3tipapa/">GitHub</a> からご覧ください。</p>';
      return;
    }
    document.getElementById("works-count").textContent = works.length;

    // タグ一覧
    const tagCount = new Map();
    works.forEach((w) => w.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
    const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const tagBar = document.getElementById("tag-bar");
    tagBar.innerHTML = tags
      .map((t) => `<button type="button" class="chip mono" data-tag="${esc(t)}">${esc(t)}</button>`)
      .join("");

    const state = {
      type: new URLSearchParams(location.search).get("type") || "all",
      tag: null,
      q: ""
    };

    const typeBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.getElementById("works-search");
    const countLabel = document.getElementById("filtered-count");

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.type = btn.dataset.type;
        typeBtns.forEach((b) => {
          b.classList.toggle("is-on", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        render();
      });
    });
    const initialBtn = document.querySelector(`.filter-btn[data-type="${state.type}"]`);
    if (initialBtn) {
      typeBtns.forEach((b) => {
        b.classList.toggle("is-on", b === initialBtn);
        b.setAttribute("aria-pressed", b === initialBtn ? "true" : "false");
      });
    }

    searchInput.addEventListener("input", () => {
      state.q = searchInput.value.trim().toLowerCase();
      render();
    });

    tagBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.tag = state.tag === chip.dataset.tag ? null : chip.dataset.tag;
      tagBar.querySelectorAll(".chip").forEach((c) =>
        c.classList.toggle("is-on", c.dataset.tag === state.tag)
      );
      render();
    });

    function matches(w) {
      if (state.type !== "all" && w.type.toLowerCase() !== state.type) return false;
      if (state.tag && !w.tags.includes(state.tag)) return false;
      if (state.q) {
        const hay = [w.name, w.slug, w.summaryJa, w.lang, ...w.tags]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(state.q)) return false;
      }
      return true;
    }

    function cardHtml(w) {
      const demo = w.demo
        ? `<a class="textlink" href="${esc(w.demo)}">試す<span aria-hidden="true"> ↗</span></a>`
        : "";
      return `
        <article class="card work-card">
          <p class="work-card__badges">
            <span class="badge mono ${badgeClass(w.type)}">${esc(w.type)} · ${esc(TYPE_LABEL[w.type] || "")}</span>
            <span class="mono work-card__status">${esc(STATUS_LABEL[w.status] || esc(w.status))}</span>
          </p>
          <h3 class="card__name"><a class="work-card__link" href="work.html?slug=${encodeURIComponent(w.slug)}">${esc(w.name)}</a></h3>
          <p class="card__desc">${esc(w.summaryJa)}</p>
          <p class="work-card__meta mono">
            <span>${esc(w.lang || "")}</span><span>UPD ${esc(w.updated)}</span>
            ${w.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}
          </p>
          <p class="card__action">${demo}<a class="textlink textlink--dim" href="${esc(w.repo)}">Repo<span aria-hidden="true"> ↗</span></a></p>
        </article>`;
    }

    function render() {
      const filtered = works.filter(matches);
      countLabel.textContent = `${filtered.length} / ${works.length}`;
      grid.innerHTML = filtered.map(cardHtml).join("");
    }

    render();
  }

  /* ---------- 詳細ページ ---------- */
  async function initDetail() {
    const root = document.getElementById("work-detail");
    if (!root) return;
    let works;
    try {
      works = await loadWorks();
    } catch {
      root.innerHTML = '<p class="works-error">データの読み込みに失敗しました。</p>';
      return;
    }
    const slug = new URLSearchParams(location.search).get("slug");
    const w = works.find((x) => x.slug === slug);

    if (!w) {
      root.innerHTML =
        '<p class="works-error">道具が見つかりませんでした。<a class="textlink" href="index.html">一覧へ戻る</a></p>';
      document.title = "Not found — Watanabe3ti Atlas";
      return;
    }

    document.title = `${w.name} — Watanabe3ti Atlas Works`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", w.summaryJa);

    const related = works
      .filter((x) => x.slug !== w.slug)
      .map((x) => ({ x, score:
        (x.type === w.type ? 1 : 0) + x.tags.filter((t) => w.tags.includes(t)).length * 2 }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => r.x);

    const actions = [
      w.demo ? `<a class="btn btn--primary" href="${esc(w.demo)}">試してみる<span aria-hidden="true"> ↗</span></a>` : "",
      `<a class="btn btn--ghost" href="${esc(w.repo)}">GitHub<span aria-hidden="true"> ↗</span></a>`
    ].join("");

    root.innerHTML = `
      <nav class="crumbs mono" aria-label="パンくず">
        <a href="../index.html">HOME</a> / <a href="index.html">WORKS</a> / <span>${esc(w.name)}</span>
      </nav>
      <dl class="meta mono">
        <div><dt>TYPE</dt><dd>${esc(w.type)}</dd></div>
        <div><dt>STATUS</dt><dd class="${w.status === "ACTIVE" ? "is-active" : ""}">${esc(STATUS_LABEL[w.status] || esc(w.status))}</dd></div>
        <div><dt>UPDATED</dt><dd>${esc(w.updated)}</dd></div>
        <div><dt>TECH</dt><dd>${esc(w.lang || "—")}</dd></div>
      </dl>
      <h1 class="detail-title">${esc(w.name)}</h1>
      <p class="detail-desc">${esc(w.summaryJa)}</p>
      <p class="detail-tags">${w.tags.map((t) => `<span class="chip chip--static mono">#${esc(t)}</span>`).join("")}</p>
      <div class="detail-actions">${actions}</div>
      ${related.length ? `
      <section class="related" aria-labelledby="related-title">
        <h2 class="section__title" id="related-title">Related works<span class="section__sub">関連する制作物</span></h2>
        <div class="grid grid--3">
          ${related.map((r) => `
            <article class="card">
              <p class="card__type mono">${esc(r.type)}</p>
              <h3 class="card__name"><a class="work-card__link" href="work.html?slug=${encodeURIComponent(r.slug)}">${esc(r.name)}</a></h3>
              <p class="card__desc">${esc(r.summaryJa)}</p>
            </article>`).join("")}
        </div>
      </section>` : ""}
    `;
  }

  initIndex();
  initDetail();
})();
