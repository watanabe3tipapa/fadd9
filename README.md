# fadd9

**Guitar, notated.**

fadd9 は、ギターを入り口に **ABC記法(テキストで書く楽譜)** を専門的に扱う独習ライブラリです。既存 ABC 記法の弱点である「動くサンプルの少なさ」を埋めることを軸に、コード進行・スケール・リフ・曲をコピーして即使える譜例として公開します。

[![Version](https://img.shields.io/badge/version-v1.0.0--rebuild-blue.svg)](https://watanabe3tipapa.github.io/fadd9/updates/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue.svg)](https://watanabe3tipapa.github.io/fadd9/)
[![GitHub](https://img.shields.io/github/issues/watanabe3tipapa/fadd9.svg)](https://github.com/watanabe3tipapa/fadd9/issues)

---

## 概要

- **名前の由来**: ギターコードの Fadd9(F・A・C・G)。浮き系の美しい響き。
- **コンセプト**: 「ギター教室」のような独習環境。商売ではなく、自分(と訪れた独習者)のための練習拠点。
- **本質**: 楽譜をテキストで持つこと。エディタで書け、Git で diff が見え、abcjs に貼れば即鳴る。

## 主な対応

- Hero — Fadd9 コードダイアグラム(SVG 手描き)+ コンセプト導線
- Why ABC — テキスト記譜の利点(TEXT / GIT / PLAY)
- Samples — 手書き譜例ボード(study / progression)
- **Samples Library** — `data/samples.json` 正本の譜例 12 件。カテゴリ(練習/コード進行/スケール/リフ/曲)・検索・タグで絞り込み、詳細ページから ABC テキストをワンクリックコピー
- **Play & Render** — 詳細ページで楽譜を SVG 描画し、ブラウザ内で再生(速度変更 WARP 対応)。abcjs v6 をローカル同梱、外部通信ゼロ
- Roadmap — フェーズ計画
- Updates + Atom feed — 更新履歴
- ⌘K Command Palette — 譜例 12 件も横断検索

---

## 技術スタック

素の HTML/CSS/JS。ビルド工程なし・外部フォント/JS ライブラリ不使用(オフライン可)。

| ツール | 必要 | 確認コマンド |
|---|---|---|
| Web ブラウザ | 必須 | — |
| Git | 任意 | `git --version` |
| Python 3 | 任意 (ローカルプレビュー) | `python3 --version` |

## 開始手順

```bash
git clone https://github.com/watanabe3tipapa/fadd9.git
cd fadd9
python3 -m http.server 8000
# http://localhost:8000
```

操作: ⌘K / Ctrl+K / `/` で Command Palette。デプロイは main ブランチへの push で GitHub Pages に自動反映。

## ロードマップ

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | トップページ刷新(fadd9 転換) | ✅ 完了 |
| 2 | Samples Library(data JSON 正本 + 一覧/検索/詳細) | ✅ 完了 |
| 3 | Play & Render(abcjs ローカル同梱、描画と再生) | ✅ 完了 |
| 4 | Reference & Playground(チートシート、Fadd9 OS 統合) | 計画 |

## リポジトリ構成(主なファイル)

```
fadd9/
├── index.html          # LP 本体(Hero + Why ABC + Samples + Library + Roadmap)
├── samples/index.html  # 譜例ライブラリ一覧(?category=exercise/chords/scales/riffs/songs)
├── samples/sample.html # 譜例詳細(?slug=)+ ABC コピー + 練習ヒント + 関連譜例
├── works/index.html    # レガシーカタログ(Phase 後半で改修)
├── works/work.html     # 個別ページ(?slug=)
├── now/index.html      # Now ページ(移行中)
├── os/index.html       # Fadd9 OS(旧 Atlas OS、Phase 4 で改修)
├── updates/index.html  # 更新履歴タイムライン
├── css/style.css       # デザイントークン / レスポンシブ
├── js/vendor/abcjs-basic-min.js  # abcjs v6(楽譜描画+合成再生、ローカル同梱)
├── js/main.js          # reveal アニメーション / 年表示
├── js/palette.js       # Command Palette(譜例を遅延ロードで横断検索)
├── js/samples.js       # 譜例一覧・詳細レンダラ(+コピー機能)
├── js/works.js         # レガシー一覧・詳細レンダラ
├── js/os.js            # ウィンドウマネージャ / Compact Mode
├── data.json           # サイト設定メタデータ
├── data/samples.json   # 譜例台帳の正本(12 譜例)
├── data/works-*.json   # レガシーデータ
├── feed.xml            # Atom feed
├── sitemap.xml / robots.txt
└── og.png              # OGP 共有画像(1200×630、差し替え予定)
```

## samples.json のスキーマ

| フィールド | 内容 |
|---|---|
| slug | URL 用 ID(`sample.html?slug=`) |
| name / nameJa | 曲・練習名(英/日) |
| category | exercise / chords / scales / riffs / songs |
| level | BEGINNER / INTERMEDIATE / ADVANCED |
| key / meter / tempo | 調・拍子・速度(Q: 表記) |
| tags | 検索用タグ配列 |
| summaryJa / tipsJa | 概要と練習ヒント |
| abc | ABC テキスト本体(X:/T:/M:/L:/Q:/K: 順) |

## 既知の制限

- サンプル詳細は JS レンダリングのため、クローラによっては本文を取得できない(title/description は差し替え済み)
- サブページ(works / now / os / updates)は旧 Atlas のまま。順次改修
- og.png は旧デザインのまま。差し替え予定
- 再生は Web Audio 対応ブラウザのみ(Safari など非対応環境では譜面と COPY のみ)

---

## 連絡先 / 公開サイト

- GitHub: https://github.com/watanabe3tipapa/fadd9
- 公開サイト (GitHub Pages): https://watanabe3tipapa.github.io/fadd9/
- 作者サイト: https://watanabe3ti.com/
- X: https://twitter.com/watanabe3tipapa

---

## 開発・保守状態

- 最終更新: 2026-08-24 (Phase 2 — Samples Library)
