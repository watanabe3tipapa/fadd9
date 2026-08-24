# DEV-MEMO — FADD9

最終更新: 2026-08-24(修正記録 — コピー成功のスクリーンリーダー通知)
旧 Atlas ポータルからの全面転換以降の設計決定を記録する。Atlas 時代の記録は下部「レガシー記録」に残す。

## Rebuild 1(2026-08-24)— fadd9 転換

### コンセプト決定

| 項目 | 決定 |
| --- | --- |
| サイト名 | **fadd9**(ギターコード Fadd9 = F・A・C・G に由来) |
| 方向性 | 「ギター教室のような独習環境」。商業的な教室サイトではなく独習ライブラリ |
| 本質 | ギターを入り口に、**ABC 記法を専門的に扱う**。既存 ABC 記法(Chris Walshaw)ベースで独自拡張はしない |
| 差別化 | 既存 ABC 界の弱点「動くサンプルが少ない」→ 実用的な譜例ライブラリで埋める |
| タグライン | `Guitar, notated.` |

### フェーズ計画

1. Phase 1 — index.html 全面刷新 ✅
2. Phase 2 — Samples Library(`data/samples.json` 正本 + 一覧/検索/詳細。works の仕組みを流用)
3. Phase 3 — Play & Render(abcjs をローカル同梱し描画+再生。ゼロ依存方針は維持=外部通信なし)
4. Phase 4 — Reference & Playground(チートシート、入力即再生、Fadd9 OS 改修)

### Phase 1 の実装

- Hero: 左にコピー、右に **Fadd9 コードダイアグラム(SVG 手描き)**。押弦位置 x x 3 2 1 3、ドット内に音名 F/A/C/G を直書き。`aria-label` で押弦説明を読み上げ
- favicon: コード図風 SVG data URI に差し替え
- Why ABC: TEXT / GIT / PLAY の 3 カード
- Samples: `.abc-board`(エディタ風パネル)+ 実際に有効な ABC テキストを 2 例(study-01 / progression-01)。`<pre>` 内は手書き直書き
- Library: Chords/Scales/Riffs/Songs + `PLANNED` バッジ。死んだリンクを作らない(Updates へ導線)
- Roadmap: signal-list 流用。`time` 要素に PHASE 表記(datetime="phase-2" は非日時だが視覚ラベル優先)
- palette.js: 静的インデックスを fadd9 構成へ差し替え(WORLD 三兄弟を削除、RSS を追加)。works 遅延ロードはレガシーカタログ閲覧用として維持
- recent.js: ホームから外した(ファイルは Phase 2 再利用のため温存。`#recent-list` 非存在時は自動無効化される)
- sitemap.xml / robots.txt / feed.xml / data.json: fadd9 ドメインとコンセプトへ更新。feed は atlas 履歴を破棄し Rebuild 1 エントリのみに
- CSS 追記: `.hero__layout`, `.chord-figure`, `.abc-board`, `.badge-soft`, `.grid--4`, `.planned`, `.section__lead`。既存トークン(濃紺/ティール/月光黄)は踏襲

### 未消化(次フェーズ以降)

- サブページ works / now / os / updates はまだ旧 Atlas 文言。順次改修
- og.png 差し替え
- Samples 譜例の data JSON 化(Phase 2 の種データ)

---

## Phase 2(2026-08-24)— Samples Library

### 目的

「既存 ABC 記法の弱点=動くサンプルの少なさ」を埋める譜例ライブラリを実装。works の一覧/詳細アーキテクチャを流用し、`data/samples.json` を正本にした。

### 新規ファイル

| ファイル | 役割 |
| --- | --- |
| `data/samples.json` | 譜例台帳の正本。12 譜例 × category(exercise/chords/scales/riffs/songs) |
| `samples/index.html` | 一覧。カテゴリフィルタ(`?category=`)/検索/タグチップ |
| `samples/sample.html` | 詳細(`?slug=`)。ABC ボード+COPY ボタン+練習ヒント+関連譜例 |
| `js/samples.js` | 一覧・詳細レンダラ。clipboard API + execCommand フォールバック |

### 設計上の決定

1. **ABC は全て検算済み**: 小節長 = 拍子×L を手計算で確認(eighth 数の整合)。`>` (broken rhythm)、`[EG]`(重音)、`z`(休止)、`^` `_`(臨時記号)など記法要素をサンプル間で分散させ、「読む辞書」も兼ねる
2. **楽曲はパブリックドメインのみ**(Ode to Joy / Greensleeves)。著作権のあるリフは書かない
3. **コピー体験を最優先**: 詳細ページの COPY ボタンが Phase 2 の核。Phase 3 の描画・再生が来るまでの実用性担保
4. **関連譜例スコアリング**: 同カテゴリ +2、タグ一致 +1(旧 works は同タイプ+1/タグ+2 だったが、カテゴリの方が音楽的近さに効くため重みを反転)
5. **palette 遅延ロードを works → samples に切替**。レガシーカタログは palette 対象外(ページ内検索で足りる)
6. **ホーム Library カードを実リンク化**(`?category=`)。PLANNED バッジ廃止、EXERCISE カード追加

### 未消化

- 描画・再生なし(abcjs 同梱は Phase 3)
- og.png 差し替え、updates ページの fadd9 化
- samples/sample.html の OGP 動的差し替えは title/description のみ

---

## Phase 3(2026-08-24)— Play & Render

### 目的

譜例を「読める」だけでなく「鳴らせる」状態にする。abcjs をローカル同梱し、詳細ページで楽譜描画+合成再生を提供。

### 追加物

| ファイル | 内容 |
| --- | --- |
| `js/vendor/abcjs-basic-min.js` | abcjs v6.7.0(500KB, UMD→`ABCJS` グローバル)。jsDelivr から取得し同梱 |
| `samples/sample.html` 変更 | vendor スクリプトを palette/samples より先に defer 読み込み |
| `js/samples.js` 変更 | `renderScore()` — renderAbc(responsive:"resize") + SynthController(CreateSynth) |

### 設計上の決定

1. **紙色パネル**: 濃紺テーマ上に楽譜を直接描画すると配色調整が abcjs 内部に依存するため、`#fdfbf4` の紙カードに黒譜面。楽譜=紙という記号性も狙う
2. **フォールバック三段構成**: abcjs 未読込 → ABC ソースのみ / 描画例外 → fallback メッセージ+ソース / Web Audio 非対応(`ABCJS.synth.supportsAudio()`) → audio-bar を非表示
3. **WARP 対応**(`displayWarp`): 練習用に速度変更を標準提供。displayLoop/Restart も ON
4. **setTune の userAction=false**: 自動再生せず、ユーザーが ▶ を押してから発火(自動再生ポリシー回避)
5. **外部通信ゼロの維持**: 音源は abcjs 同梱の合成音。CDN 参照はランタイムに存在しない
6. ホーム譜例ボードのファイル名を詳細ページへリンク化、Roadmap PHASE 3 を ✅ 化

### 未消化

- 再生中の音符ハイライト(cursorControl)は未実装
- 一覧ページでのミニスコア描画(重いので見送り)

---

## Phase 4(2026-08-24)— Reference & Playground

### 目的

「読める・鳴らせる」に続く三段目「**書ける**」を提供する。ABC 記法の学習辞書(Reference)と、書いて即確認できる実験場(Playground)で、独習のループを閉じる。

### 新規ファイル

| ファイル | 役割 |
| --- | --- |
| `reference/index.html` | ABC記法チートシート。ヘッダフィールド/音名/臨時記号/時値/broken rhythm/反復/休符/重音/コード記号 |
| `js/reference.js` | `[data-demo]` 属性付き要素へ DEMOS マップの実例スコアを renderAbc で描画 |
| `playground/index.html` | エディタ + 描画パネル + audio-bar |
| `js/playground.js` | 入力 debounce 350ms → renderAbc + SynthController.setTune。COPY/CLEAR/サンプル読込/localStorage 下書き |

### 改修ファイル

| ファイル | 内容 |
| --- | --- |
| `os/index.html` / `js/os.js` | Atlas OS → **Fadd9 OS**(練習室)。データ正本を works JSON → `data/samples.json` へ切替。フォルダ=カテゴリ(exercise/chords/scales/riffs/songs)、Start Here/Readme を fadd9 文言へ、ブランド `◉ FADD9 OS`、localStorage キーも `fadd9-os-mode` へ変更 |
| `now/index.html` | 「現在地」→「練習の現在地」。PRACTICING(ウォームアップ)/INTERESTED(理論と耳)/NEXT 構成。譜例詳細への直リンクつき |
| `updates/index.html` | fadd9 フェーズ履歴に刷新(Atlas Release 履歴は DEV-MEMO に退避) |
| `index.html` | localnav に Reference/Playground 追加(Roadmap を外す)、footer SITES 更新 |
| `js/palette.js` | PAGE に Reference/Playground 追加 |
| `sitemap.xml` / `feed.xml` | /reference/ /playground/ 追加、Phase 4 エントリ追加 |
| `og.png` | PIL で再生成: 濃紺グラデ + コード図(ティールナット/金ドット)+ Menlo ロゴタイプ + タグライン |
| `css/style.css` | `.ref-grid/.ref-item/.ref-code/.ref-demo`(紙色ミニパネル)、`.pg-select`、`.playground__*`、`#pg-input` を追記 |

### 設計上の決定

1. **チートシートの実例は静的 HTML + data-demo 属性**: 各記法要素の説明文は HTML 直書き(SEO/noscript でも意味が通る)し、譜面だけ JS が描画。DEMOS マップを js/reference.js に一元化し、ABC 追加時はマップ編集のみ
2. **Playground は K: 必須ガード**: `K:` を含まない入力では描画せずステータスに案内表示(abcjs の全画面エラー回避)。構文エラー時は譜面を消して理由を status 行に表示
3. **下書きは localStorage(`fadd9-playground-draft`)**: リロードしても書きかけが消えない。CLEAR はストレージを消さず入力欄のみクリア(誤操作に寛容)
4. **サンプル読込ドロップダウン**: samples.json の abc をそのまま流し込み → 「ライブラリから拾って改造する」動線。読込後は select をリセット
5. **Fadd9 OS は「体験」から「練習室」へ**: レガシー works データへの依存を絶ち、Samples UI と完全に同じ正本を読む。ファイル行は詳細ページ(?slug=)へ。Compact Mode の挙動は踏襲
6. **now は練習ログの入口**: BUILDING/INTERESTED/NEXT 構造は維持しつつ中身をギター練習に置換。譜例 slug への直リンクで回遊を作る

### 未消化(Phase 5 以降)

- works 一覧/詳細の処遇(レガシーカタログとして温存か、削除か)
- 再生中の音符ハイライト(cursorControl)
- 軽量計測(方針決定後に GoatCounter 等を検討)
- 譜例の増強(指弾き・スライド・モード別スケール)

---

## 修正記録(2026-08-24)— コピー成功のスクリーンリーダー通知

### 背景

外部分析レポート(bump2.md)の「要対応・高」4件を検証したところ、2件は誤報だった:

| 指摘 | 検証結果 |
| --- | --- |
| CSS が `.foot` で切断 | 誤報(style.css は 1801 行で完結、`.footer` 群も正常) |
| HTML セマンティクス不足 | ほぼ対応済み(index.html は figure/aria-label 完備) |
| aria 属性の不足 | **一部実在**(下記対応) |
| playground.js のエスケープ漏れ | 誤報(createElement + textContent で安全、innerHTML 不使用) |

### 対応

1. `js/playground.js` — COPY 成功時、既存の `#pg-status`(role="status")に「ABC をクリップボードにコピーしました」を表示し 1.5 秒後にクリア。ボタンラベル swap のみだった通知をライブリージョンで読み上げ可能に
2. `js/samples.js` — 詳細ページ `#copy-note` に `role="status"` を付与(hidden トグル時に読み上げされる)
3. `samples/index.html` — 絞り込み件数 `#filtered-count` の `<p>` に `role="status"` を付与(検索・フィルタ結果を通知)

### 教訓

分析レポートの指摘は必ずコードで検証してから着手する。レポーターは「.foot で切断」のように見た目由来の誤検知や、DOM API vs innerHTML の違いを見落とすことがある。

---

## 修正記録(2026-08-24)— Atlas 関係の全面オミット

### 判断

fadd9 への転換が完了したため、旧ポータル(watanabe3tipapa/atlas)に関する公開記述・レガシーカタログをすべて削除した。works の canonical/og:url が `github.io/atlas/` を指したまま残存しており、実害になりうる状態だった。

### 削除

- `works/index.html` / `works/work.html`(レガシー道具カタログ。JS レンダラごと廃止)
- `js/works.js` / `js/recent.js`(recent.js は参照元が皆無のデッドコードだった)
- `data/works-tools.json` / `data/works-lab.json`(Atlas 時代の正本データ。fadd9 の正本は `data/samples.json` のみ)

### 改修

- `index.html` — footer SITES の Works 行を削除
- `js/palette.js` — Works をインデックスから削除。「Now — 現在地(移行中)」→「Now — 練習の現在地」へ(移行完了済みのため)
- `sitemap.xml` — `/works/` を削除
- `updates/index.html` / `feed.xml` — 「旧 Atlas ポータル」を「旧ポータル」に文言修正(履歴事実は保持)
- `css/style.css` — 先頭コメントを「FADD9 — style.css」へ、「Release 3 — Atlas OS」→「Fadd9 OS」
- `README.md` — 既知の制限から works 行を削除

### 保持したもの

- DEV-MEMO 下部の「レガシー記録」は設計判断(OGP 生成手法・palette 設計など)のアーカイブとして内部資料にのみ保持。公開サイトからは完全に除去済み。
- CSS の `.work-card` 等のクラス名は Samples UI が流用しているため改名せず。

---

# レガシー記録 — Watanabe3ti Atlas LP(〜 v0.1.1)

最終更新: 2026-08-23(Release 4 追録)
対象: PLAN_bump.md(Atlas 構想書)Release 1〜4 の実装記録

## 決定事項

| 項目 | 決定 |
| --- | --- |
| 技術スタック | 素の HTML/CSS/JS（ビルド工程なし）。道具メタデータは `data.json` に分離し Release 2 以降の正本データの種とする |
| 公開 URL | https://watanabe3tipapa.github.io/atlas/ （GitHub Pages プロジェクトページ / main ブランチ・ルート配信） |
| Featured | Toolsmith のみを大きく掲載 |
| 連絡先 | メール非掲載。SNS リンクのみ（X / Facebook / Instagram） |
| 言語 | 日本語主・英語補助（Hero コピーは英→日併記） |

## ファイル構成

```
atlas/
├── index.html      # LP 本体（7 セクション + OGP）
├── css/style.css   # デザイントークン / レスポンシブ / reduced-motion 対応
├── js/main.js      # 軽量演出のみ（IntersectionObserver の reveal / 年表示）
├── data.json       # 道具・世界・拠点メタデータ（Release 2 用の種。HTML が正本）
├── .nojekyll       # Jekyll 処理の無効化
├── README.md
├── DEV-MEMO.md     # 本ファイル
├── PLAN.md         # 元提案書
└── PLAN_bump.md    # ブラッシュアップ版構想書
```

## セクション構成（index.html）

1. **Hero** — `WATANABE3TI.COM` + 「I build small systems for following curiosity.」（日訳併記）+ CTA: `Enter the OS`(→ os/index.html の Atlas OS) / `Takeoff`(→ next)
2. **Featured** — Toolsmith 単体カード: `TYPE: TOOLBOX / STATUS: ACTIVE / FIELD: TOOLS · NEWS · LINKS`
3. **Signal** — Toolsmith NEWS 最新 3 本へ直リンク（Arm AGI CPU 2026.03.26 / Groq 2025.08.06 / Willow 2024.12.10）
4. **Three routes** — Tools(→ Toolsmith) / Experiments(→ GitHub) / Notes(→ BLOG)
5. **Worlds** — Classic OS(main) / Digital Tunnel(neo) / Mission Control(next) を Interface Modes として紹介
6. **Proof of work** — GitHub / BLOG / LOG / Wiki / Toolsmith を役割説明付きカードで
7. **Footer** — X / Facebook / Instagram + 各拠点リンク + 更新情報案内

## 実データリンク一覧（取得済み・検証済み）

| 名称 | URL | 役割 |
| --- | --- | --- |
| main | https://watanabe3ti.com/ | Mac OS 9 風デスクトップ体験 |
| neo | https://watanabe3ti.com/neo/ | バイナリトンネル背景の OS 体験 |
| next | https://watanabe3ti.com/next/ | 「Takeoff to Wonder」思想の入口 |
| BeOS | https://watanabe3ti.com/beos/ | BeOS 体験（LP では Worlds 補足扱い） |
| GitHub | https://github.com/watanabe3tipapa/ | コードと実験 |
| BLOG | https://watanabe3ti.txt-nifty.com/ | 長文発信 |
| LOG | https://log.watanabe3ti.com/ | 日々のログ |
| Wiki | https://wiki.watanabe3ti.com/ | 知識整理 |
| Toolsmith | https://toolsmith.watanabe3ti.com/ | 道具箱（baserCMS） |
| X | https://twitter.com/watanabe3tipapa | SNS |
| Facebook | https://www.facebook.com/toru.watanabe3ti | SNS |
| Instagram | https://www.instagram.com/chombo_watanabe3tipapa | SNS |
| NEWS 記事 | https://toolsmith.watanabe3ti.com/news/archives/{29,28,27} | Signal セクション用 |

## デザイントークン

- ベース: 濃紺 `#0a0e1a` / 面は `#101627` / 文字: 白〜薄灰 `#e8ecf4` / 薄文字 `#9aa5bd`
- アクセント: ティール `#2dd4bf` / 電気的青 `#60a5fa` / 月光黄 `#fde68a`
- メタデータラベル（TYPE/STATUS/FIELD）は等幅フォントで統一
- OS 風装飾は見出し・ラベル・カード枠に限定（PLAN 原則 1〜3 準拠）
- アクセシビリティ: セマンティック HTML / skip link / focus-visible / prefers-reduced-motion / カード全体をリンク化せずテキストリンクを明示

## 制約・注意点

- サブパス配信（`/atlas/`）のため全アセットは**相対パス**で参照（先頭 `/` 禁止）
- 外部フォント・外部 JS ライブラリ不使用（ゼロ依存・オフライン可）
- OGP: title / description / url / type のみ。og:image は将来対応（PLAN セクション 9）
- `data.json` は現時点では HTML の鏡像（種データ）。fetch 依存の機能は作らない

## 公開手順（実施済みコマンド）

```sh
git init -b main
git add .
git commit -m "feat: Watanabe3ti Atlas LP (Release 1)"
gh repo create watanabe3tipapa/atlas --public --source=. --push \
  --description "Watanabe3ti Atlas — Curiosity, indexed."
gh api -X POST repos/watanabe3tipapa/atlas/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

確認: https://watanabe3tipapa.github.io/atlas/

## Release 2 実装記録（2026-08-23）— 道具の地図化

### 目的
PLAN Release 2 の完了条件「主要な制作物を一覧・検索・詳細で辿れる」を実現。GitHub 公開リポジトリ（非 fork 約 95 件）から主要 30 件を厳選し、カタログ化した。

### 新規ファイル

| ファイル | 役割 |
| --- | --- |
| `data/works-tools.json` | TOOL タイプ 15 件の正本データ |
| `data/works-lab.json` | EXPERIMENT 10 件 + WRITING 5 件の正本データ |
| `js/works.js` | 一覧（フィルタ・検索・タグ）と詳細（?slug=・関連道具）のレンダラ |
| `works/index.html` | 道具一覧ページ（`?type=tool/experiment/writing` で初期絞り込み可） |
| `works/work.html` | 個別道具ページ（`?slug=`）。関連道具をタグ類似度で自動選出 |
| `now/index.html` | Now ページ（現在地: BUILDING / INTERESTED / NEXT） |

### 更新ファイル

- `index.html` — ローカルナビに Works / Now 追加、Three routes を内部ページへ接続、Footer SITES 拡充
- `css/style.css` — サブページ共通（page-head / crumbs）、フィルタ UI、バッジ、詳細・Now スタイルを追記
- `data.json` — routes を内部 URL 化

### 設計上の決定

1. **データ分割**: works データは 30 件で容量が大きいため `data.json`（サイト設定）と `data/works-*.json`（道具台帳）に分離。JS 側で Promise.all でマージ
2. **個別ページは JS レンダリング**（`work.html?slug=xxx`）: ビルド工程なし方針のため静的生成はしない。SEO は title/description を JS で差し替える簡易対応。将来 SSG 化する場合の移行元として data JSON が正本
3. **タイプ体系**: TOOL（道具）/ EXPERIMENT（実験）/ WRITING（ノート）の 3 分類 × STATUS（ACTIVE / WIP / PROTOTYPE）
4. **関連道具**: 同タイプ +1 点、タグ一致 +2 点でスコアリングし上位 4 件
5. **noscript フォールバック**: 一覧・詳細とも JS 無効時は GitHub への導線を表示
6. **エスケープ**: レンダリング時に全項目 HTML エスケープ（esc 関数）

### Works 収録 30 件の内訳

- TOOL 15: tui-md-viewer, tomorrow-radio, txt-crypter-neo, moji-code, markitdown-ce, markitdown-uv, msword-markdown-ce, screen-capture-api, pdf-sandbox, lexical-html, ollama-model-runner, ollama-eo-pe, notion-ollama-pe, site-uploader-pe, var-watcher
- EXPERIMENT 10: frameworks-now, standard-libraries-now, joke-macos9-pe, textual-gemini-cli, ir-qubit, svg-generator, seek-an, daily-news-digest, graph-tutorial, obsidian-quartz-ce
- WRITING 5: markdown-dev(markdown.dev), docgist-pe, zakki6, pelican-white-paper, mintlify-docs

### 今後（Release 3〜）

- Release 3: OS(main) 側とコンテンツ共通化、Start here パネル、Command Palette、Compact Mode
- Release 4: Recent Files 自動化、RSS 整理、OGP 画像、軽量計測
- 改善候補: work.html の OGP 動的差し替え強化、works 全件（約95件）への拡張、sitemap.xml 追加

---

## Release 3 実装記録（2026-08-23）— OS との統合

### 目的
完了条件「同じ道具データを Atlas と OS から読める」を実現。Atlas UI と OS UI の双方が `data/works-*.json` を正本として参照する構造にした。

### 新規ファイル

| ファイル | 役割 |
| --- | --- |
| `os/index.html` | Atlas OS ビュー。Mac OS 9 風メニューバー + デスクトップ + ドック |
| `js/os.js` | ウィンドウマネージャ（開閉・ドラッグ・フォーカス）、フォルダ生成、Compact Mode、時計 |

### Command Palette（`js/palette.js`）

- 全ページで `⌘K` / `Ctrl+K` または右下の検索ボタンで起動
- インデックス: 静的（ページ・世界・拠点）+ 道具30件（遅延 fetch）
- 相対ベースパスは `location.pathname` の深さから自動算出 → どの階層のページでも動く
- キーボード操作: ↑↓ 移動 / ↵ 決定 / Esc 閉じる。外部リンクは新規タブ
- キーボードに依存しない検索ボタンも常設（PLAN セクション6 の要件）

### Atlas OS の設計

- **フォルダ=データ**: Applications(TOOL) / Experiments(EXPERIMENT) / Documents(WRITING) / Links(hubs) は JSON からレンダリング。ファイル行クリックで Atlas の詳細ページへ遷移する二層構造
- **Start Here ウィンドウ**: デスクトップモード時、読み込み直後に自動オープン（初見者への導線）。Atlas HOME / Works / Now / 本家 main・next へのリンク
- **Readme**: 本家 main へのオマージュであること、データ共有構造、起動演出を意図的に省略した旨を明記
- **ウィンドウ**: ポインタイベントによるドラッグ、z-index フォーカス管理、Esc で最前面を閉じる（Palette 開閉中は譲る）
- **Compact Mode**: 幅 719px 以下ではデスクトップではなくセクション一覧を表示（`localStorage: atlas-os-mode` で手動切替も保存）。PLAN の「翻訳層」方針に準拠
- 起動演出なし（即座に使える OS。Skip boot 要件の解決策）

## Release 4 実装記録（2026-08-23）— 再訪性の強化

| 追加物 | 内容 |
| --- | --- |
| Recent Files | ホームに最新5件を `updated` 降順で自動表示（`js/recent.js`）。ローカルナビにも Recent を追加 |
| Updates ページ | `updates/index.html` — Release ごとのタイムライン。完了条件「更新の流れが追える」に対応 |
| Atom feed | `feed.xml` — Atlas 更新用フィード。Updates ページ・ホームフッター・palette から導線 |
| sitemap.xml / robots.txt | 5 URL を登録、robots.txt から Sitemap 明示（PLAN セクション9 の是正） |
| OGP 画像 | `og.png`（1200×630, PIL で生成: 濃紺グラデーション+月+ティールグロー+ロゴタイプ）。全主要ページの og:image に設定 |

### 計測について（意図的な保留）

プライバシー配慮型の軽量計測（GoatCounter 等）は外部アカウント登録が必要なため、本リリースでは**導入を見送り**。導入時は PLAN の指標表（理解/発見/回遊/再訪/包摂性）に紐づけて設定すること。

### 既知の制限・今後

- `works/work.html?slug=` は JS レンダリングのためクローラによっては詳細本文を取得できない（title/description は差し替え済み）。SSG 化すれば解消
- feed.xml は手書きの静的ファイル。更新時に手動で entry 追加が必要
- works 収録は厳選30件。全件（非 fork 約95件）への拡張は data JSON の増備のみで対応可能
- og.png の視認確認はブラウザで要確認（生成は成功、1200×630）

---

## 修正記録（2026-08-23）— Command Palette の常時表示バグ

### 症状
全ページで Palette の背景オーバーレイが最初から表示され、Esc / 背景クリックで
閉じても見た目が変わらない状態。「入力しないと展開不可？」と誤解する UX になっていた。

### 根本原因
`.palette-overlay { display: flex }` の作者スタイルが UA スタイルシートの
`[hidden] { display: none }` より優先され、`hidden` 属性が無効化されていた。
`hidden` 属性は author CSS の display 指定に負ける古典的な落とし穴。

### 対応
1. `.palette-overlay[hidden] { display: none !important }` を追加（根本修正）
2. フロートボタンを「🔍 検索 ⌘K」と明示ラベル化。aria-haspopup / aria-expanded 追加
3. Palette 開いている間は body スクロールをロック
4. `/` キーでも開くショートカットを追加（INPUT/TEXTAREA 入力中は無効）。フッター表記も更新

### 教訓
`hidden` 属性を使う要素に author 側で display を指定する場合は
`.x[hidden] { display: none }` を必ず併記する。
（Release 3 の `.compact[hidden]` では正しく対応済みだった。片方だけ抜けたパターン）
