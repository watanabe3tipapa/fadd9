/* FADD9 — Samples Library
   data/samples.json を正本に、一覧(検索・カテゴリ・タグ)と詳細(?slug=)を描画する。 */
(() => {
  "use strict";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const CATEGORY_LABEL = {
    exercise: "練習",
    chords: "コード進行",
    scales: "スケール",
    riffs: "リフ&フレーズ",
    songs: "曲"
  };
  const LEVEL_LABEL = {
    BEGINNER: "入門",
    INTERMEDIATE: "中級",
    ADVANCED: "上級"
  };

  async function loadSamples() {
    const res = await fetch("../data/samples.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).samples;
  }

  /* ---------- 一覧ページ ---------- */
  async function initIndex() {
    const grid = document.getElementById("samples-grid");
    if (!grid) return;
    let samples;
    try {
      samples = await loadSamples();
    } catch {
      grid.innerHTML =
        '<p class="works-error">データの読み込みに失敗しました。<a class="textlink" href="../data/samples.json">samples.json</a> からご覧ください。</p>';
      return;
    }
    document.getElementById("samples-count").textContent = samples.length;

    const tagCount = new Map();
    samples.forEach((s) => s.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
    const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const tagBar = document.getElementById("tag-bar");
    tagBar.innerHTML = tags
      .map((t) => `<button type="button" class="chip mono" data-tag="${esc(t)}">${esc(t)}</button>`)
      .join("");

    const state = {
      type: new URLSearchParams(location.search).get("category") || "all",
      tag: null,
      q: ""
    };

    const typeBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.getElementById("samples-search");
    const countLabel = document.getElementById("filtered-count");

    function syncTypeButtons() {
      typeBtns.forEach((b) => {
        b.classList.toggle("is-on", b.dataset.type === state.type);
        b.setAttribute("aria-pressed", b.dataset.type === state.type ? "true" : "false");
      });
    }

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.type = btn.dataset.type;
        syncTypeButtons();
        render();
      });
    });
    syncTypeButtons();

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

    function matches(s) {
      if (state.type !== "all" && s.category !== state.type) return false;
      if (state.tag && !s.tags.includes(state.tag)) return false;
      if (state.q) {
        const hay = [s.name, s.nameJa, s.slug, s.summaryJa, s.key, ...s.tags]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(state.q)) return false;
      }
      return true;
    }

    function cardHtml(s) {
      return `
        <article class="card work-card">
          <p class="work-card__badges">
            <span class="badge mono badge--tool">${esc(s.category.toUpperCase())} · ${esc(CATEGORY_LABEL[s.category] || "")}</span>
            <span class="mono work-card__status">${esc(s.level)} · ${esc(LEVEL_LABEL[s.level] || "")}</span>
          </p>
          <h3 class="card__name"><a class="work-card__link" href="sample.html?slug=${encodeURIComponent(s.slug)}">${esc(s.name)}</a></h3>
          <p class="card__desc">${esc(s.nameJa)} — ${esc(s.summaryJa)}</p>
          <p class="work-card__meta mono">
            <span>KEY ${esc(s.key)}</span><span>${esc(s.meter)} @${esc(s.tempo.split("=")[1] || "")}</span>
            <span>UPD ${esc(s.updated)}</span>
          </p>
          <p class="card__action"><a class="textlink" href="sample.html?slug=${encodeURIComponent(s.slug)}">譜面と解説<span aria-hidden="true"> →</span></a></p>
        </article>`;
    }

    function render() {
      const filtered = samples.filter(matches);
      countLabel.textContent = `${filtered.length} / ${samples.length}`;
      grid.innerHTML = filtered.length
        ? filtered.map(cardHtml).join("")
        : '<p class="works-error">該当する譜例がありません。キーワードを変えてみてください。</p>';
    }

    render();
  }

  /* ---------- 詳細ページ ---------- */
  async function initDetail() {
    const root = document.getElementById("sample-detail");
    if (!root) return;
    let samples;
    try {
      samples = await loadSamples();
    } catch {
      root.innerHTML = '<p class="works-error">データの読み込みに失敗しました。</p>';
      return;
    }
    const slug = new URLSearchParams(location.search).get("slug");
    const s = samples.find((x) => x.slug === slug);

    if (!s) {
      root.innerHTML =
        '<p class="works-error">譜例が見つかりませんでした。<a class="textlink" href="index.html">一覧へ戻る</a></p>';
      document.title = "Not found — fadd9 Samples";
      return;
    }

    document.title = `${s.name} — fadd9 譜例`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", s.summaryJa);

    // OGP タグの動的差し替え
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${s.name} — fadd9 譜例`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", s.summaryJa);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", `https://watanabe3tipapa.github.io/fadd9/samples/sample.html?slug=${encodeURIComponent(s.slug)}`);
    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute("content", "article");
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) twitterCard.setAttribute("content", "summary");

    const related = samples
      .filter((x) => x.slug !== s.slug)
      .map((x) => ({ x, score:
        (x.category === s.category ? 2 : 0) + x.tags.filter((t) => s.tags.includes(t)).length }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.x);

    root.innerHTML = `
      <nav class="crumbs mono" aria-label="パンくず">
        <a href="../index.html">HOME</a> / <a href="index.html">SAMPLES</a> / <span>${esc(s.slug)}</span>
      </nav>
      <dl class="meta mono">
        <div><dt>CATEGORY</dt><dd>${esc(s.category.toUpperCase())} · ${esc(CATEGORY_LABEL[s.category] || "")}</dd></div>
        <div><dt>LEVEL</dt><dd>${esc(s.level)} · ${esc(LEVEL_LABEL[s.level] || "")}</dd></div>
        <div><dt>KEY / METER</dt><dd>${esc(s.key)} · ${esc(s.meter)}</dd></div>
        <div><dt>TEMPO</dt><dd>${esc(s.tempo)}</dd></div>
      </dl>
      <h1 class="detail-title">${esc(s.name)}</h1>
      <p class="detail-desc">${esc(s.nameJa)} — ${esc(s.summaryJa)}</p>
      <p class="detail-tags">${s.tags.map((t) => `<span class="chip chip--static mono">#${esc(t)}</span>`).join("")}</p>

      <figure class="score-panel" aria-label="${esc(s.name)} の楽譜">
        <div id="score-render">
          <noscript><p class="score-fallback">楽譜の描画には JavaScript が必要です。</p></noscript>
        </div>
      </figure>

      <div class="audio-bar" id="audio-panel" hidden>
        <div id="audio-controls"></div>
        <p class="audio-hint mono">WARP で速度を落として練習できます。</p>
      </div>

      <figure class="abc-board abc-board--detail">
        <figcaption class="abc-board__head">
          <span class="abc-board__file mono">${esc(s.slug)}.abc</span>
          <button type="button" class="btn-copy mono" id="copy-btn" aria-label="ABC テキストをコピー">COPY</button>
        </figcaption>
        <pre id="abc-code"></pre>
      </figure>
      <p class="copy-note mono" id="copy-note" role="status" hidden>Copied to clipboard ✓ — abcjs editor などに貼ってすぐ鳴ります。</p>

      <section class="tips" aria-labelledby="tips-title">
        <h2 class="section__title" id="tips-title">How to practice<span class="section__sub">練習のヒント</span></h2>
        <p class="section__lead">${esc(s.tipsJa)}</p>
      </section>

      ${related.length ? `
      <section class="related" aria-labelledby="related-title">
        <h2 class="section__title" id="related-title">Related samples<span class="section__sub">関連する譜例</span></h2>
        <div class="grid grid--3">
          ${related.map((r) => `
            <article class="card">
              <p class="card__type mono">${esc(r.category.toUpperCase())}</p>
              <h3 class="card__name"><a class="work-card__link" href="sample.html?slug=${encodeURIComponent(r.slug)}">${esc(r.name)}</a></h3>
              <p class="card__desc">${esc(r.nameJa)}</p>
            </article>`).join("")}
        </div>
      </section>` : ""}
    `;

    const pre = document.getElementById("abc-code");
    pre.textContent = s.abc;

    renderScore(s);

    const btn = document.getElementById("copy-btn");
    const note = document.getElementById("copy-note");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(s.abc);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = s.abc;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      note.hidden = false;
      btn.textContent = "COPIED";
      setTimeout(() => {
        note.hidden = true;
        btn.textContent = "COPY";
      }, 2000);
    });
  }

  /* ---------- 楽譜描画と再生(abcjs) ---------- */
  function renderScore(s) {
    const scoreEl = document.getElementById("score-render");
    const audioPanel = document.getElementById("audio-panel");
    if (!scoreEl || !window.ABCJS) return; // abcjs 未読込時は ABC ソースのみで成立

    let visualObj;
    try {
      visualObj = window.ABCJS.renderAbc(scoreEl, s.abc, {
        responsive: "resize",
        add_classes: true,
        paddingtop: 14,
        paddingbottom: 14,
        paddingleft: 18,
        paddingright: 18
      })[0];
    } catch (e) {
      scoreEl.innerHTML = '<p class="score-fallback">この譜面の描画に失敗しました。下の ABC ソースは利用できます。</p>';
      return;
    }

    if (!audioPanel || !window.ABCJS.synth.supportsAudio()) return; // 再生非対非対応環境では譜面だけ
    audioPanel.hidden = false;

    const cursorControl = {
      onReady() {},
      onStart() {},
      onBeat() {},
      onEvent(ev) {
        scoreEl.querySelectorAll(".abcjs-note_selected").forEach(el => {
          el.classList.remove("abcjs-note_selected");
        });
        if (ev && ev.elements) {
          ev.elements.forEach(group => {
            group.forEach(el => el.classList.add("abcjs-note_selected"));
          });
        }
      },
      onFinished() {
        scoreEl.querySelectorAll(".abcjs-note_selected").forEach(el => {
          el.classList.remove("abcjs-note_selected");
        });
      }
    };

    const synthControl = new window.ABCJS.synth.SynthController();
    synthControl.load("#audio-controls", cursorControl, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayWarp: true
    });

    new window.ABCJS.synth.CreateSynth()
      .init({
        visualObj,
        options: {
          program: 24,
          soundFontUrl: "../soundfont/FluidR3_GM/"
        }
      })
      .then(() => synthControl.setTune(visualObj, false))
      .catch(() => { audioPanel.hidden = true; });
  }

  initIndex();
  initDetail();
})();
