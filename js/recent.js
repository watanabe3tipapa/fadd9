/* Watanabe3ti Atlas — Recent Files
   data/works-*.json の updated を降順に並べ、ホームに最新5件を表示する。 */
(() => {
  "use strict";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const list = document.getElementById("recent-list");
  if (!list) return;

  const files = ["data/works-tools.json", "data/works-lab.json"];
  Promise.all(files.map((f) => fetch(f).then((r) => r.json())))
    .then((results) => {
      const works = results.flatMap((r) => r.works);
      works.sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0));
      list.innerHTML = works
        .slice(0, 5)
        .map(
          (w) => `
        <li>
          <time datetime="${esc(w.updated)}">${esc(w.updated)}</time>
          <span class="badge mono ${w.type === "TOOL" ? "badge--tool" : w.type === "EXPERIMENT" ? "badge--exp" : "badge--writing"}">${esc(w.type)}</span>
          <a href="works/work.html?slug=${encodeURIComponent(w.slug)}">${esc(w.name)}</a>
          <span class="recent-lang">${esc(w.lang || "")}</span>
        </li>`
        )
        .join("");
    })
    .catch(() => {
      list.innerHTML = '<li><span class="works-error">読み込みに失敗しました。</span></li>';
    });
})();
