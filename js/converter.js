/* FADD9 — Code Converter
   3タブ: コード→フレット / ABC→音名 / フレット→音名 */
(() => {
  "use strict";

  /* ---- music math ---- */
  const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const OPEN = [4, 11, 7, 2, 9, 4]; // E2 A2 D3 G3 B3 E4 pitch classes

  function noteFromPitch(p) { return NOTE_NAMES[((p % 12) + 12) % 12]; }
  function pitchFromNote(n) {
    const i = NOTE_NAMES.indexOf(n.replace(/b/g, "#"));
    return i >= 0 ? i : null;
  }

  /* ---- chord formulas ---- */
  const CHORDS = {
    "":        [0, 4, 7],
    "m":       [0, 3, 7],
    "dim":     [0, 3, 6],
    "aug":     [0, 4, 8],
    "sus2":    [0, 2, 7],
    "sus4":    [0, 5, 7],
    "7":       [0, 4, 7, 10],
    "m7":      [0, 3, 7, 10],
    "maj7":    [0, 4, 7, 11],
    "dim7":    [0, 3, 6, 9],
    "m7b5":    [0, 3, 6, 10],
    "add9":    [0, 4, 7, 14],
    "madd9":   [0, 3, 7, 14],
    "9":       [0, 4, 7, 10, 14],
    "m9":      [0, 3, 7, 10, 14],
    "6":       [0, 4, 7, 9],
    "m6":      [0, 3, 7, 9],
  };

  function parseChordName(name) {
    const m = name.trim().match(/^([A-G][#b]?)(.*)$/);
    if (!m) return null;
    const root = pitchFromNote(m[1]);
    const qual = CHORDS[m[2]];
    if (root == null || qual === undefined) return null;
    return { root, intervals: qual };
  }

  function fretsForChord(name, maxFret) {
    const ch = parseChordName(name);
    if (!ch) return null;
    const max = maxFret || 12;
    const results = [];
    for (let capo = 0; capo <= 5; capo++) {
      const tuning = OPEN.map((p) => (p + capo) % 12);
      const frets = tuning.map((tp) => {
        for (let f = 0; f <= max - capo; f++) {
          if (ch.intervals.includes(((tp + f) - ch.root + 12) % 12)) return f;
        }
        return -1;
      });
      if (frets.some((f) => f >= 0)) results.push({ capo, frets });
    }
    return results;
  }

  /* ---- ABC ↔ notes ---- */
  function abcToNotes(abc) {
    return abc
      .replace(/[_#!^=]|\/\//g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((tok) => {
        const m = tok.match(/^([A-Ga-g],*)(-?\d*)$/);
        if (!m) return tok;
        let note = m[1];
        let octShift = 0;
        const commaCount = (note.match(/,/g) || []).length;
        const apostropheCount = (note.match(/'/g) || []).length;
        note = note.replace(/[,'"]/g, "");
        const isUpper = note === note.toUpperCase();
        const base = note.toUpperCase();
        let pitch = pitchFromNote(base);
        if (pitch == null) return tok;
        if (isUpper) pitch += 12 * (4 - commaCount);
        else pitch += 12 * (5 - commaCount);
        pitch += apostropheCount * 12;
        return noteFromPitch(pitch);
      });
  }

  function notesToAbc(notes) {
    return notes
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((n) => {
        const m = n.trim().match(/^([A-G][#b]?)(\d)$/);
        if (!m) return n.trim();
        const pitch = pitchFromNote(m[1]);
        const oct = parseInt(m[2], 10);
        if (pitch == null || isNaN(oct)) return n.trim();
        if (oct >= 5) return m[1].toLowerCase() + "'".repeat(oct - 5);
        if (oct <= 3) return m[1].toUpperCase() + ",".repeat(3 - oct);
        return m[1].toUpperCase();
      })
      .join(" ");
  }

  /* ---- fret ↔ note ---- */
  function noteAtFret(stringIdx, fret) {
    return noteFromPitch((OPEN[stringIdx] + fret) % 12);
  }

  function fretForNote(stringIdx, noteName) {
    const target = pitchFromNote(noteName);
    if (target == null) return null;
    for (let f = 0; f <= 12; f++) {
      if ((OPEN[stringIdx] + f) % 12 === target) return f;
    }
    return null;
  }

  /* ---- DOM ---- */
  const $tabs = document.querySelector("[data-converter]");
  if (!$tabs) return;

  function switchTab(id) {
    $tabs.querySelectorAll("[data-panel]").forEach((p) => {
      p.hidden = p.dataset.panel !== id;
    });
    $tabs.querySelectorAll("[data-tab]").forEach((t) => {
      t.classList.toggle("is-active", t.dataset.tab === id);
    });
  }

  $tabs.addEventListener("click", (ev) => {
    const tab = ev.target.closest("[data-tab]");
    if (tab) switchTab(tab.dataset.tab);
  });

  /* -- tab: chord → fret -- */
  const $cfInput = $tabs.querySelector("#cf-input");
  const $cfBtn = $tabs.querySelector("#cf-btn");
  const $cfOut = $tabs.querySelector("#cf-out");

  function renderChordFret() {
    const name = $cfInput.value.trim();
    if (!name) { $cfOut.innerHTML = ""; return; }
    const results = fretsForChord(name);
    if (!results || !results.length) {
      $cfOut.innerHTML = '<p class="muted">該当するコードが見つかりません。</p>';
      return;
    }
    $cfOut.innerHTML = results
      .slice(0, 4)
      .map((r) => {
        const capoNote = r.capo > 0 ? ` (カポ ${r.capo})` : "";
        const labels = ["E", "A", "D", "G", "B", "e"];
        const row = r.frets
          .map((f, i) => `<span class="cf-cell">${labels[i]}: ${f === 0 ? "open" : f === -1 ? "×" : f}</span>`)
          .join("");
        return `<div class="cf-result"><span class="cf-capo mono">${esc(name)}${capoNote}</span><div class="cf-row">${row}</div></div>`;
      })
      .join("");
  }

  $cfBtn.addEventListener("click", renderChordFret);
  $cfInput.addEventListener("keydown", (e) => { if (e.key === "Enter") renderChordFret(); });

  /* -- tab: abc ↔ notes -- */
  const $anInput = $tabs.querySelector("#an-input");
  const $anBtn = $tabs.querySelector("#an-btn");
  const $anDir = $tabs.querySelector("#an-dir");
  const $anOut = $tabs.querySelector("#an-out");

  function renderAbcNotes() {
    const val = $anInput.value.trim();
    if (!val) { $anOut.innerHTML = ""; return; }
    const dir = $anDir.value;
    try {
      if (dir === "abc2note") {
        const notes = abcToNotes(val);
        $anOut.innerHTML = `<span class="mono">${esc(notes.join(" "))}</span>`;
      } else {
        const abc = notesToAbc(val);
        $anOut.innerHTML = `<span class="mono">${esc(abc)}</span>`;
      }
    } catch {
      $anOut.innerHTML = '<p class="muted">変換エラー。</p>';
    }
  }

  $anBtn.addEventListener("click", renderAbcNotes);
  $anInput.addEventListener("keydown", (e) => { if (e.key === "Enter") renderAbcNotes(); });
  $anDir.addEventListener("change", renderAbcNotes);

  /* -- tab: fret → note -- */
  const $fnInputs = $tabs.querySelectorAll(".fn-fret-input");
  const $fnBtn = $tabs.querySelector("#fn-btn");
  const $fnOut = $tabs.querySelector("#fn-out");
  const $fnReverse = $tabs.querySelector("#fn-reverse-input");
  const $fnReverseBtn = $tabs.querySelector("#fn-reverse-btn");
  const $fnReverseOut = $tabs.querySelector("#fn-reverse-out");
  const stringNames = ["6弦(E)", "5弦(A)", "4弦(D)", "3弦(G)", "2弦(B)", "1弦(e)"];

  function renderFretNote() {
    const frets = Array.from($fnInputs).map((el) => parseInt(el.value, 10));
    if (frets.some(isNaN)) {
      $fnOut.innerHTML = '<p class="muted">全ての弦にフレット番号を入力してください。</p>';
      return;
    }
    $fnOut.innerHTML = frets
      .map((f, i) => `<span class="fn-note">${stringNames[i]}: <strong>${noteAtFret(i, f)}</strong> (fret ${f})</span>`)
      .join("");
  }

  function renderNoteFret() {
    const val = $fnReverse.value.trim();
    if (!val) { $fnReverseOut.innerHTML = ""; return; }
    const noteName = val.replace(/b/g, "#").toUpperCase();
    const pitch = pitchFromNote(noteName);
    if (pitch == null) { $fnReverseOut.innerHTML = '<p class="muted">有効な音名を入力してください。</p>'; return; }
    $fnReverseOut.innerHTML = OPEN
      .map((_, i) => {
        const f = fretForNote(i, noteName);
        return `<span class="fn-note">${stringNames[i]}: fret ${f != null ? f : "—"}</span>`;
      })
      .join("");
  }

  $fnBtn.addEventListener("click", renderFretNote);
  $fnReverseBtn.addEventListener("click", renderNoteFret);
  $fnReverse.addEventListener("keydown", (e) => { if (e.key === "Enter") renderNoteFret(); });

  /* ---- utils ---- */
  function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
})();
