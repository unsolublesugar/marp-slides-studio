---
description: テーマ・CSSを触るときの規範（変数上書きのみ・コントラスト下限・登録と検証）
---

# テーマ・CSS 規範

作業手順は marp-theme スキル、設計の背景は `.steering/architecture.md`、Marp固有の制約は `.steering/marp-constraints.md` を参照。

## テーマの作り方

- **テーマ側にセレクタは書かない**。CSS変数の上書きのみで作る（例外は `themes/layout-*.css` レイヤーだけ）
- 手本: 配色だけなら `themes/wine.css`、雰囲気ごと変えるなら `themes/casual-mint.css`
- トーン（書体・角丸・影・罫線・装飾）は `themes/base.css` の `:root` トークンで表現する。表現できない場合はまず base.css にトークンを足す
- 組み方を変えるときだけ `layout-*.css` を作り、組み合わせテーマは `@import "<カラー>"; @import "layout-<レイアウト>";` の2行にする（**必ずカラー→レイアウトの順**）
- テーマCSSの**2行目コメントは `カテゴリ / 配色: 用途` の1行形式**で書く。`npm run new` の一覧とギャラリーの説明文として機械的に読まれる

## コントラストの下限

- 文字色×地色: 本文 4.5:1 / 大きい文字 3:1
- コードパネル: `--code-bg` の上で `--code-*` が 6:1 以上（`--primary-dark` が明るいテーマは `--code-bg` に暗色を個別指定）
- 濃色面のラベルは `--on-primary-faint`、淡色地の章番号は `--accent-ink`（`--accent` が明るいテーマは濃色を個別指定）

## base.css を触るとき

- レイアウトは既存パターンで組む。新パターンは base に追加してから使い、`template/slides.md` と `.claude/skills/marp-deck/patterns.md` にも登録する
- 部品の縦間隔は `.body > * + *`（`--stack-gap`）で一元管理。個々の部品に `margin-bottom` を足さない。自前で gap を持つ横並びレイアウトを `.body` に追加したら、base.css の `:not()` 連鎖にもクラス名を足す
- 新しい「文字色×地色」の組を足したら `scripts/theme-check.mjs` の `PAIRS` にも1行足す

## 検証と登録（必須）

1. `npm run theme-check` を通す（コントラスト検査 + `.vscode/settings.json` 登録漏れ検出。閾値割れゼロにする）
2. `npm run gallery -- <テーマ名>` で実物を確認する（目視だけで判断しない）
3. テーマの追加・削除・改名・用途変更は、marp-theme スキルの「登録先」節のチェックリストに従って各所を更新する
