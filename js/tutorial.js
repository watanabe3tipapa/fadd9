/* FADD9 — Tutorial
   チュートリアルページの機能（COPY ボタン、abcjs 描画） */
(() => {
  "use strict";

  /* ---------- COPY ボタン ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const abc = btn.dataset.copy.replace(/\\n/g, "\n");
      try {
        await navigator.clipboard.writeText(abc);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = abc;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = "COPIED";
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });
})();