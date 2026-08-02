---
name: marp-theme
description: Marpテーマの追加・変更・確認ワークフロー。「テーマを追加して」「配色を変えたい」「テーマの見え方を確認して」「全テーマを見比べたい」、または themes/ のCSSを触るときに必ず使う。コントラスト検査とギャラリーでの実物確認、登録先の更新手順を含む。
---

# Marpテーマの追加・変更ワークフロー

テーマは `themes/` にあり、CSS変数の上書きだけで作る。組み方そのものを変えるときだけ `layout-*.css`（唯一セレクタを持つレイヤー）を足す。

## 確認のしかた

| コマンド | 何ができるか |
| --- | --- |
| `npm run gallery` | 全テーマを template/slides.md の全レイアウトパターンでPNG化し、一覧HTMLを生成してブラウザで開く。通常表示は代表4枚（表紙 / 章扉 / 箇条書き / コード）で、テーマごと・一括で全パターンに展開できる |
| `npm run gallery -- sunrise wave-coral` | テーマを絞って確認する（全テーマ生成は数分かかるので、確認対象が決まっているときはこちら） |
| `npm run theme-check` | 配色のコントラスト比を機械的に検査する。閾値割れがあれば終了コード1 |
| `npm run theme-check -- sunrise` | テーマを絞って検査する |

ギャラリーは名前・説明での絞り込みと、配色／組み合わせの切り替えができる。画像はクリックで原寸。生成物は `.gallery/`（.gitignore済み）。

**目視だけで判断しない。** 濃色パネル上の小さいラベルなど、目視では気づけない低コントラストが必ず残る。`npm run theme-check` を通してから `npm run gallery` で実物を見る、の順で確認する。

## 手順

1. **作る**: 配色だけなら `themes/wine.css`、雰囲気ごと変えるなら `themes/casual-mint.css`、暗いキャンバスや白地＋装飾など組み方から変えるなら `themes/layout-aurora.css` / `themes/layout-wave.css` を手本にする
2. **検査**: `npm run theme-check` を通す（閾値割れゼロにする）
3. **実物確認**: `npm run gallery -- <テーマ名>` で4枚を見る
4. **登録**: 下の5箇所を更新する
5. **見本スクショ**: `npm run docs-shot` で `docs/*.png` を撮り直す（marp-shots スキル）

## 登録先（テーマの追加・削除・改名・用途変更のとき）

このリストが正。hook や他のドキュメントはここへ誘導するだけなので、変更はこの節に対して行う。

1. **README.md** — 冒頭のテーマ数、該当する一覧表、ディレクトリ構成の `themes/`。レイアウトレイヤーを足したならMarp特有の注意書きも。件数を書くのは「テーマN種」「名前はN個」の2表現だけにする（この2つは `npm run theme-check` が実数と照合する。それ以外の件数表記は腐るので書かない）
2. **CLAUDE.md** — 構成セクションのテーマ一覧
3. **.claude/skills/marp-deck/SKILL.md** — テーマ選択の一覧
4. **.vscode/settings.json** — `markdown.marp.themes`。`layout-*` レイヤー自体も登録する（未登録だとVS Codeプレビューで `@import` が解決できない）。登録漏れは `npm run theme-check` が検出する
5. **scripts/docs-shot.mjs** — `COLOR_THEMES` / `TONES` / `LAYOUTS` に追加してから `npm run docs-shot`

`npm run new` のテーマ一覧・`template/slides.md`・ギャラリーは `themes/` から動的に列挙するので更新不要。テーマCSSの2行目コメント（`カテゴリ / 配色: 用途` の1行）がそのまま一覧の説明文になるため、この形式で書く。

## 決まりごと・制約の参照先

- 配色・トークン設計・コントラスト下限などの規範: [.claude/rules/theme-css.md](../../rules/theme-css.md)
- Marp/Marpit の変えられない制約（疑似要素・PDF描画差・light-dark() など）: [.steering/marp-constraints.md](../../../.steering/marp-constraints.md) — レイアウトレイヤーを作るときは必ず読む
- テーマシステムの設計意図: [.steering/architecture.md](../../../.steering/architecture.md)
