/* FADD9 — Playground
   ABC テキストを書くと即座に描画し、再生コントロールも追従させる。
   下書きは localStorage に自動保存。 */
(() => {
  "use strict";

  const DEFAULT_ABC =
    'X:1\nT:my first tune\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\n' +
    '|: C D E F G A B c | c B A G F E D C :|';

  const STORE_KEY = "fadd9-playground-draft";

  const input = document.getElementById("pg-input");
  const scoreEl = document.getElementById("pg-score");
  const statusEl = document.getElementById("pg-status");
  const audioPanel = document.getElementById("pg-audio");
  const sampleSel = document.getElementById("pg-sample");

  if (!input || !scoreEl) return;

  let synthControl = null;
  let renderTimer = null;
  let audioReady = false;

  /* ---------- 下書きの復元 ---------- */
  try {
    input.value = localStorage.getItem(STORE_KEY) || DEFAULT_ABC;
  } catch {
    input.value = DEFAULT_ABC;
  }

  /* ---------- 描画と再生 ---------- */
  function update() {
    const abc = input.value;
    if (!window.ABCJS) {
      statusEl.textContent = "abcjs を読み込めませんでした";
      return;
    }

    // 入力が空や不完全なときのちらつき防止
    if (!abc.includes("K:")) {
      statusEl.textContent = "K: (調性) がないと描画できません";
      return;
    }

    scoreEl.innerHTML = "";
    let visualObj = null;
    try {
      visualObj = window.ABCJS.renderAbc(scoreEl, abc, {
        responsive: "resize",
        add_classes: true,
        foregroundColor: "#1a1d26",
        paddingtop: 14,
        paddingbottom: 14,
        paddingleft: 18,
        paddingright: 18
      })[0];
    } catch {
      statusEl.textContent = "構文エラー — 譜面が一時的に消えています";
      return;
    }

    const warns = (visualObj && visualObj.warnings ? visualObj.warnings.length : 0);
    statusEl.textContent = warns
      ? `警告 ${warns} 件 — 描画は続行しています`
      : "OK — 描画しました";

    initAudio();
    if (synthControl && visualObj && audioReady) {
      synthControl.setTune(visualObj, false, {
        program: 24,
        soundFontUrl: "../soundfont/FluidR3_GM/"
      }).catch(() => {});
    }
  }

  function initAudio() {
    if (audioReady || !window.ABCJS.synth.supportsAudio()) return;
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

    synthControl = new window.ABCJS.synth.SynthController();
    synthControl.load("#pg-controls", cursorControl, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayWarp: true,
      program: 24,
      soundFontUrl: "../soundfont/FluidR3_GM/"
    });
    audioReady = true;
  }

  /* ---------- 入力イベント(debounce) ---------- */
  input.addEventListener("input", () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      update();
      try { localStorage.setItem(STORE_KEY, input.value); } catch {}
    }, 350);
  });

  /* ---------- ツールバー ---------- */
  document.getElementById("pg-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = input.value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const btn = document.getElementById("pg-copy");
    btn.textContent = "COPIED";
    statusEl.textContent = "ABC をクリップボードにコピーしました";
    setTimeout(() => {
      btn.textContent = "COPY";
      statusEl.textContent = "";
    }, 1500);
  });

  document.getElementById("pg-print").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("pg-clear").addEventListener("click", () => {
    input.value = "";
    scoreEl.innerHTML = "";
    statusEl.textContent = "クリアしました。書き始めてください。";
    input.focus();
  });

  fetch("../data/samples.json")
    .then((r) => r.json())
    .then((d) => {
      for (const s of d.samples) {
        const opt = document.createElement("option");
        opt.value = s.abc;
        opt.textContent = `${s.category.toUpperCase()} · ${s.name}`;
        sampleSel.appendChild(opt);
      }
    })
    .catch(() => {});

  sampleSel.addEventListener("change", () => {
    if (!sampleSel.value) return;
    input.value = sampleSel.value;
    try { localStorage.setItem(STORE_KEY, input.value); } catch {}
    update();
    sampleSel.selectedIndex = 0;
  });

  update();
})();
