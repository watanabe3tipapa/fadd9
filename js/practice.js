/* FADD9 — Practice Log
   localStorage ベースの練習記録 CRUD + 連続日数ストリーク。 */
(() => {
  "use strict";

  const KEY = "fadd9_practice_log";

  /* ---- helpers ---- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(entries) { localStorage.setItem(KEY, JSON.stringify(entries)); }
  function today() { return new Date().toISOString().slice(0, 10); }

  /* streak: 連続日数を計算 */
  function calcStreak(entries) {
    if (!entries.length) return 0;
    const dates = [...new Set(entries.map((e) => e.date))].sort().reverse();
    let streak = 1;
    const d = new Date(dates[0]);
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      if (dates[i] === prev.toISOString().slice(0, 10)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  /* ---- render ---- */
  const $root = document.querySelector("[data-practice]");
  if (!$root) return;

  let entries = load();
  let editingIdx = null;

  function render() {
    const streak = calcStreak(entries);
    const total = entries.length;

    /* summary */
    const $sum = $root.querySelector("[data-practice-summary]");
    if ($sum) {
      $sum.innerHTML =
        `<span class="practice-stat">${streak}<small>日連続</small></span>` +
        `<span class="practice-stat">${total}<small>件記録</small></span>`;
    }

    /* form */
    const $form = $root.querySelector("[data-practice-form]");
    if ($form) {
      $form.querySelector("[name=date]").value = today();
    }

    /* list */
    const $list = $root.querySelector("[data-practice-list]");
    if (!$list) return;
    if (!entries.length) {
      $list.innerHTML = '<p class="muted">まだ記録がありません。最初の練習を記録しましょう。</p>';
      return;
    }
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    $list.innerHTML = sorted
      .map((e, i) => {
        const realIdx = entries.indexOf(e);
        return `<div class="practice-entry">
          <div class="practice-meta">
            <span class="practice-date mono">${e.date}</span>
            ${e.bpm ? `<span class="practice-bpm mono">${e.bpm} BPM</span>` : ""}
            ${e.duration ? `<span class="practice-dur mono">${e.duration}分</span>` : ""}
          </div>
          <p class="practice-what">${esc(e.what)}</p>
          ${e.note ? `<p class="practice-note muted">${esc(e.note)}</p>` : ""}
          <div class="practice-actions">
            <button class="textlink" data-edit="${realIdx}" type="button">編集</button>
            <button class="textlink textlink--danger" data-del="${realIdx}" type="button">削除</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---- events ---- */
  $root.addEventListener("click", (ev) => {
    const delIdx = ev.target.closest("[data-del]");
    if (delIdx) {
      const idx = Number(delIdx.dataset.del);
      entries.splice(idx, 1);
      save(entries);
      render();
      return;
    }
    const editBtn = ev.target.closest("[data-edit]");
    if (editBtn) {
      const idx = Number(editBtn.dataset.edit);
      const e = entries[idx];
      editingIdx = idx;
      const $form = $root.querySelector("[data-practice-form]");
      $form.querySelector("[name=date]").value = e.date;
      $form.querySelector("[name=what]").value = e.what;
      $form.querySelector("[name=bpm]").value = e.bpm || "";
      $form.querySelector("[name=duration]").value = e.duration || "";
      $form.querySelector("[name=note]").value = e.note || "";
      $form.querySelector("[name=what]").focus();
    }
  });

  $root.addEventListener("submit", (ev) => {
    if (!ev.target.matches("[data-practice-form]")) return;
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const entry = {
      date: fd.get("date") || today(),
      what: (fd.get("what") || "").trim(),
      bpm: (fd.get("bpm") || "").trim(),
      duration: (fd.get("duration") || "").trim(),
      note: (fd.get("note") || "").trim(),
    };
    if (!entry.what) return;
    if (editingIdx !== null) {
      entries[editingIdx] = entry;
      editingIdx = null;
    } else {
      entries.push(entry);
    }
    save(entries);
    ev.target.reset();
    $root.querySelector("[name=date]").value = today();
    render();
  });

  render();
})();
