/* FADD9 — Worksheets
   採譜ワークシートの一覧を描画する。 */
(() => {
  "use strict";

  const WORKSHEETS = [
    {
      type: "warmup",
      name: "Warm-up Template",
      nameJa: "ウォームアップ用",
      description: "毎日のウォームアップ記録用。テンポと日付を記入し、進捗を残しましょう。"
    },
    {
      type: "chords",
      name: "Chord Progression Template",
      nameJa: "コード進行記入用",
      description: "コード進行をメモしながら採譜。各小節のコード名と音符を対応させられます。"
    },
    {
      type: "melody",
      name: "Melody Transcription",
      nameJa: "メロディ採譜用",
      description: "メロディを聴きながら書き留める。音程とリズムに集中できるレイアウト。"
    },
    {
      type: "riff",
      name: "Riff & Phrase Template",
      nameJa: "リフ・フレーズ記入用",
      description: "短いフレーズを繰り返し書くためのテンプレート。リズムの記録に最適。"
    },
    {
      type: "scale",
      name: "Scale Practice Template",
      nameJa: "スケール練習用",
      description: "スケールの上昇・下降を記録。指板パターンとの対応を確認できます。"
    },
    {
      type: "general",
      name: "General Worksheet",
      nameJa: "汎用ワークシート",
      description: "何にでも使える汎用テンプレート。自由に採譜・メモができます。"
    }
  ];

  const grid = document.getElementById("worksheet-grid");
  if (!grid) return;

  grid.innerHTML = WORKSHEETS.map(w => `
    <article class="worksheet-card">
      <p class="card__type mono">${w.type.toUpperCase()}</p>
      <h3 class="card__name">${w.nameJa}</h3>
      <p>${w.description}</p>
      <p class="card__action">
        <a class="textlink" href="worksheet.html?type=${w.type}">開く<span aria-hidden="true"> →</span></a>
      </p>
    </article>
  `).join("");
})();