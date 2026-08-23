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
- Samples — 手書き譜例ボード(study / progression)。Phase 2 でライブラリ化
- Library — Chords / Scales / Riffs / Songs カテゴリ(準備中)
- Roadmap — フェーズ計画
- Updates + Atom feed — 更新履歴
- ⌘K Command Palette — 全ページ共通

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
| 2 | Samples Library(data JSON 正本 + 一覧/検索/詳細) | 着手予定 |
| 3 | Play & Render(abcjs ローカル同梱、描画と再生) | 計画 |
| 4 | Reference & Playground(チートシート、Fadd9 OS 統合) | 計画 |

## リポジトリ構成(主なファイル)

```
fadd9/
├── index.html          # LP 本体(Hero + Why ABC + Samples + Library + Roadmap)
├── works/index.html    # レガシーカタログ(Phase 2 でサンプルライブラリへ改修)
├── works/work.html     # 個別ページ(?slug=)
├── now/index.html      # Now ページ(移行中)
├── os/index.html       # Fadd9 OS(旧 Atlas OS、Phase 4 で改修)
├── updates/index.html  # 更新履歴タイムライン
├── css/style.css       # デザイントークン / レスポンシブ
├── js/main.js          # reveal アニメーション / 年表示
├── js/palette.js       # Command Palette(全ページ共通)
├── js/works.js         # レガシー一覧・詳細レンダラ
├── js/os.js            # ウィンドウマネージャ / Compact Mode
├── js/recent.js        # Recent Files(Phase 2 で再利用予定)
├── data.json           # サイト設定メタデータ
├── data/works-*.json   # レガシーデータ(Phase 2 で samples.json へ統合予定)
├── feed.xml            # Atom feed
├── sitemap.xml / robots.txt
└── og.png              # OGP 共有画像(1200×630)
```

## 既知の制限

- サブページ(works / now / os / updates)は旧 Atlas のまま。Phase 2〜4 で順次改修
- og.png は旧デザインのまま。差し替え予定
- Samples の譜例は現在手書き HTML。Phase 2 で data JSON 化

---

## 連絡先 / 公開サイト

- GitHub: https://github.com/watanabe3tipapa/fadd9
- 公開サイト (GitHub Pages): https://watanabe3tipapa.github.io/fadd9/
- 作者サイト: https://watanabe3ti.com/
- X: https://twitter.com/watanabe3tipapa

---

## 開発・保守状態

- 最終更新: 2026-08-24 (Rebuild 1 — fadd9 転換)
