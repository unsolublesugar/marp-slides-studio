# コントリビュートガイド

バグ報告・テーマ/レイアウトの追加・ドキュメント改善を歓迎します。

## 開発の流れ

1. Issue で報告・提案する（テンプレートあり）。大きめの変更は着手前に Issue で方向性をすり合わせると手戻りが少ないです
2. ブランチを切って変更する（`feat/` `fix/` `docs/` などの接頭辞付き。main へ直接コミットしない）
3. 下記「PR前のチェック」を通してから Pull Request を作る

セットアップは README の[使い始める](README.md#使い始める)を参照してください（`npm install` のみ。PDF/PNG出力にはローカルの Chrome / Chromium が必要です）。

## PR前のチェック

- `themes/` や `scripts/` を触った場合は `npm run theme-check` を通す（exit 0。CI でも実行されます）
- テーマの見た目に関わる変更は `npm run gallery` で実物を確認してから PR にする（目視だけで判断しない）
- README 掲載画像に影響する変更は `npm run docs-shot` で撮り直し、差分をコミットに含める（`docs/*.png` を手作業で撮らない）

## テーマ・CSS を触るとき

設計ルールは [.claude/rules/theme-css.md](.claude/rules/theme-css.md) にまとまっています。要点:

- テーマ側にセレクタは書かず、CSS変数の上書きのみで作る（例外は `themes/layout-*.css` レイヤーだけ）
- コントラスト下限: 本文 4.5:1 / 大きい文字 3:1 / コードパネル 6:1（`npm run theme-check` が検査します）
- テーマの追加・改名時は `.vscode/settings.json` への登録も忘れずに（登録漏れも `theme-check` が検出します）

Marp 固有の制約（疑似要素・PDF描画差など）に引っかかったときは [.steering/marp-constraints.md](.steering/marp-constraints.md) を先に確認してください。

## コミットメッセージ

日本語で「何を・なぜ」が分かるように書いてください（1行目は変更の要約）。

## AIエージェントでの開発

このリポジトリは Claude Code のスキル（`.claude/skills/`）とルール（`.claude/rules/`）を同梱しており、AIエージェントに作業を依頼する前提の構成になっています。エージェント利用時も上記のチェックは同様に必要です。Claude Code 以外のエージェントは [AGENTS.md](AGENTS.md) が入口です。
