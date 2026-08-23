# atlas

**Curiosity, indexed.**

atlas は、watanabe3ti.com の進化版「Atlas」構想を素の HTML/CSS/JS だけで実装したポータルサイトです。制作した道具・実験・ノートを「地図」として辿れる Works カタログを中心に、Mac OS 9 風のデスクトップ体験（Atlas OS）や ⌘K Command Palette を備えます。

[![Version](https://img.shields.io/badge/version-v0.1.1-blue.svg)](https://watanabe3tipapa.github.io/atlas/updates/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue.svg)](https://watanabe3tipapa.github.io/atlas/)
[![GitHub](https://img.shields.io/github/issues/watanabe3tipapa/atlas.svg)](https://github.com/watanabe3tipapa/atlas/issues)

---

## 概要

atlas は「I build small systems for following curiosity.」（好奇心に従って小さなシステムを作り続ける）をテーマに、GitHub 上の公開リポジトリから厳選した 30 件（Tools 15 / Lab 15）をカタログ化したサイトです。`data/works-*.json` を正本データとして、Atlas UI（一覧・検索・詳細）と Atlas OS（デスクトップ体験）の双方から同じデータを読める構造になっています。

## コンセプト

制作物を類型化して「地図」に置くことで、何があるか・いま何を作っているか・次に何をするかがひと目でわかる入口を目指しています。道具は 3 つのタイプとステータスで整理されます:

- **TYPE**: TOOL（ツール）/ EXPERIMENT（実験）/ WRITING（ノート）
- **STATUS**: ACTIVE / WIP / PROTOTYPE

atlas の主な対応:

- Works — 道具の一覧・検索・タグフィルタ・個別詳細（関連道具の自動選出つき）
- Now — 現在地（BUILDING / INTERESTED / NEXT）
- Atlas OS — 同じデータを Mac OS 9 風デスクトップで読む体験モード
- Updates + Atom feed — 更新の流れを追える履歴

---

## 主な特徴

- 素の HTML/CSS/JS。ビルド工程・外部依存なし（外部フォント・外部 JS ライブラリ不使用）
- ⌘K / Ctrl+K、`/` キー、または右下の検索ボタンで起動する Command Palette（道具・ページ・外部拠点を横断移動）
- 個別ページは `works/work.html?slug=` で JS レンダリング。関連道具は同タイプ +1 点 / タグ一致 +2 点のスコアリングで上位 4 件を自動選出
- Atlas OS: ウィンドウのドラッグ・z-index フォーカス管理・Esc で最前面を閉じる。幅 719px 以下では自動で Compact Mode（一覧表示、手動切替も保存）
- Recent Files: ホームに最新 5 件を `updated` 降順で自動表示
- sitemap.xml / robots.txt / OGP 画像（og.png 1200×630）/ Atom feed（feed.xml）を同梱
- アクセシビリティ: セマンティック HTML / skip link / focus-visible / prefers-reduced-motion / noscript フォールバック

---

## 前提条件

| ツール | 必要 | 確認コマンド |
|---|---|---|
| Web ブラウザ | 必須（最新版推奨） | — |
| Git | 任意 (取得・デプロイ時) | `git --version` |
| Python 3 | 任意 (ローカルプレビュー時) | `python3 --version` |

ビルド工程がないため、上記以外の依存パッケージは不要です。

---

## 開始手順（確認できる事実のみ）

1. リポジトリを取得:

```bash
git clone https://github.com/watanabe3tipapa/atlas.git
cd atlas
```

2. ローカルサーバーで確認（静的ファイルなのでそのままブラウザで開いても可）:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

3. 主な操作:

- **⌘K / Ctrl+K**（または右下の検索ボタン、`/` キー）: Command Palette で横断移動
- **Atlas OS**: デスクトップのアイコンをクリックでウィンドウ表示。ドラッグ可。Esc で最前面を閉じる
- モバイル幅では Atlas OS は自動で Compact Mode。メニューバーから Desktop View に切替可能

4. デプロイ: main ブランチへの push で GitHub Pages に自動反映されます（プロジェクトページ / main ルート配信）。

---

## バージョン履歴

- **v0.1.1** (2026-08-23) — 「作品」表記を「道具」に統一、TOOL タイプの表示ラベルを「ツール」に変更
- **Release 4** — Recent Files 自動表示 / Updates ページ / Atom feed / sitemap.xml / OGP 画像
- **Release 3** — Atlas OS（Mac OS 9 風デスクトップ）/ Command Palette / Compact Mode
- **Release 2** — Works の地図化（一覧・検索・タグフィルタ・詳細 / Now ページ）
- **Release 1** — ランディングページ（7 セクション + OGP）

詳細は [Updates ページ](https://watanabe3tipapa.github.io/atlas/updates/) および [DEV-MEMO.md](./DEV-MEMO.md) を参照してください。

---

## リポジトリ構成（主なファイル・ディレクトリ）

- index.html — LP 本体（7 セクション + Recent Files）
- works/index.html — 道具一覧（`?type=tool/experiment/writing` で初期絞り込み可）
- works/work.html — 個別道具ページ（`?slug=` / 関連道具つき）
- now/index.html — Now ページ（現在地）
- os/index.html — Atlas OS（デスクトップ体験）
- updates/index.html — 更新履歴タイムライン
- css/style.css — デザイントークン / レスポンシブ / reduced-motion 対応
- js/main.js — ホーム用 reveal アニメーション
- js/recent.js — Recent Files（最新 5 件）
- js/works.js — Works 一覧・詳細のレンダラ
- js/os.js — ウィンドウマネージャ / Compact Mode
- js/palette.js — Command Palette（全ページ共通）
- data.json — サイト設定メタデータ
- data/works-tools.json / data/works-lab.json — 道具台帳の正本（Tools 15 / Lab 15）
- feed.xml — Atom feed（Atlas 更新）
- sitemap.xml / robots.txt — サイトマップとクロール設定
- og.png — OGP 共有画像 (1200×630)
- .nojekyll — Jekyll 処理の無効化
- DEV-MEMO.md — 実装記録（Release 1〜4 の設計決定と既知の制限）

---

## 既知の制限

- `works/work.html?slug=` は JS レンダリングのため、クローラによっては詳細本文を取得できない場合があります（title / description は差し替え済み）
- `feed.xml` は手書きの静的ファイルです。更新時に entry の手動追加が必要です
- Works 収録は厳選 30 件です。全件（非 fork 約 95 件）への拡張は data JSON の増備のみで対応可能です

---

## コントリビューション

コントリビューションは歓迎します。大きな変更は事前に issue を立ててください。

基本的なワークフロー:

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/your-feature`)
3. 変更をコミット (`git commit -m 'Add your change'`)
4. ブランチをプッシュし、Pull Request を作成

---

## 連絡先 / 公開サイト

- GitHub: https://github.com/watanabe3tipapa/atlas
- 公開サイト (GitHub Pages): https://watanabe3tipapa.github.io/atlas/
- 作者サイト: https://watanabe3ti.com/
- X: https://twitter.com/watanabe3tipapa
- Facebook: https://www.facebook.com/toru.watanabe3ti
- Instagram: https://www.instagram.com/chombo_watanabe3tipapa

---

## 開発・保守状態

- リポジトリはアーカイブされていません。
- 最終更新: 2026-08-23 (v0.1.1)
