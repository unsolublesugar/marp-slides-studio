# テーマシステムの設計

このリポジトリのテーマ・スクリプトがなぜこの形なのかの設計知識。運用規範は `.claude/rules/`、作業手順は `.claude/skills/` を参照。

## レイヤー構成

```text
base.css            … レイアウトとCSS変数トークンの実体。唯一の大きなファイル（カラーはnavy相当）
├─ カラーテーマ      … :root の変数上書きのみの十数行（例: wine.css）
├─ トーン付きテーマ  … 書体・角丸・影のトークン＋カラーを上書き（例: casual-mint.css）
├─ layout-*.css      … 唯一セレクタを持つレイヤー。baseと同じセレクタを後勝ちで上書き
└─ 組み合わせテーマ  … @import 2行だけ（例: wave-coral.css。カラー→レイアウトの順）
```

- **テーマ側にセレクタを書かない**という一線が、29テーマを数行のファイルで成立させている
- トーン（雰囲気）は base の `:root` トークン（`--font-*` / `--radius-*` / `--card-shadow` / `--panel-bar-width` など）だけで表現する。レイアウト（余白・グリッド・サイズ）は全テーマ不変
- `layout-aurora.css` はニュートラルスケール（`--gray-900`〜`--gray-50`）を丸ごと反転して暗背景対応する。base が本文・カード地・罫線をこのスケールで書いているため、入れ替えるだけで面と文字がまとめて追従する

## 縦間隔の一元管理（--stack-gap）

部品どうしの縦間隔は `.body > * + *` の1ルールで管理し、個々の部品は `margin-bottom` を持たない。
自前で gap を持つ横並びレイアウト（two-col / compare / issue-grid / shot-*）は `:not()` で除外している。
このため **`.body` 直下に置く新レイアウトを base に足したら、`:not()` 連鎖（base.css の3箇所）にもクラス名を足す**必要がある。

## テーマ情報の単一ソース

テーマのメタ情報は `themes/*.css` 自体が唯一のソース。

- ファイル2行目のコメント（`カテゴリ / 配色: 用途`）が説明文
- `@import` の有無・内容から kind（配色 / 組み合わせ）と使用レイアウトを判定
- `scripts/lib/render.mjs` の `listThemes()` / `parseThemeCss()` / `resolveVars()` がこれを読み、
  `npm run new` のテーマ一覧・ギャラリー・theme-check がすべてここから導出される

例外として手動管理が残るのは `.vscode/settings.json`（VS Code の仕様上列挙が必要。漏れは `npm run theme-check` が検出）と、`scripts/docs-shot.mjs` の見本選定（どのテーマを README に載せるかは編集判断）のみ。

## スクリプトの共通基盤

`scripts/lib/render.mjs` に共通処理を集約している: Chrome探索（`chromePath` / `requireChrome`）、
Marp一括PNG化（`renderDeckDir` — ディレクトリごと渡してChrome起動1回）、CSS解析、
引数検証（`pickThemes`）、作業ディレクトリ（`prepareWorkDir` / `pngsIn`）、エラー終了（`fail`）。
新スクリプトを書くときは、まずここにある関数を使う。

## 検証の設計思想

**目視だけで判断しない。** `npm run theme-check` が WCAG コントラスト式を自前実装して
15ペア＋コードトークンを機械検査し（違反・settings.json 登録漏れで exit 1）、
`npm run gallery` が template/slides.md の全パターンを実物PNGで確認する。
検査除外は名前でなく実態で判定する（aurora系 = `layout-aurora` を import しているか、
淡色表紙 = 表紙に乗る文字色の輝度）。**名前ベースの判定は新テーマで静かに素通りするので使わない。**
