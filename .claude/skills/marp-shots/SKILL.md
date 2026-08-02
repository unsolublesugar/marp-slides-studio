---
name: marp-shots
description: README掲載用スクリーンショット（docs/*.png）の生成ワークフロー。「READMEの画像を更新して」「テーマ一覧の画像を撮り直して」「スクショを作り直して」、またはテーマ・レイアウトパターンを追加/変更したあとの見本画像更新で必ず使う。
---

# README用スクリーンショット生成ワークフロー

`docs/*.png` は README に貼るテーマ・レイアウト・パターンの見本画像。手作業で撮らず、`scripts/docs-shot.mjs` で再現可能な形で生成する。

## 手順

1. **生成**: `npm run docs-shot`（全プリセット）/ `npm run docs-shot -- themes layouts`（指定のみ）
2. **目視確認**: 生成された `docs/<preset>.png` をReadツールで開いて確認する
   - [ ] 見本タイトルが意図しない位置で折り返していない（特に `split-*` は表紙が左半分）
   - [ ] 追加したテーマ／パターンがグリッドに入っている
   - [ ] セルの抜け・空白セルがない
3. **README側の記述と突き合わせる**: 画像の説明文（「上の例の左が navy、右が forest」など）が実際の並び順と合っているか確認する

## プリセット

| プリセット | 中身 | 段組 |
| --- | --- | --- |
| `themes` | レイアウト×配色×トーンの幅が伝わるよう選んだ表紙（`SHOWCASE_THEMES`） | 3列 |
| `tones` | トーンの代表（casual/pop/chic/business）の本文 | 2列 |
| `layouts` | レイアウトレイヤーごとの代表の表紙＋本文のペア（1行=1レイアウト） | 2列 |
| `patterns` | 代表的なレイアウトパターン（navy） | 3列・枠線 |
| `code-block` | コードブロック2枚（navy） | 2列・枠線 |
| `code-block-diff` | diff表示（navy / forest） | 2列・枠線 |
| `gallery` | テーマギャラリーのUI（`theme-gallery.mjs` を実行して撮る。`GALLERY_THEMES` = 色系統1つにつき1テーマ） | ページ実写 1280×960 |
| `theme-preview` | テーマ切替プレビューのUI（`theme-preview.mjs` を作例デッキ + `PREVIEW_THEMES` で実行して撮る） | ページ実写 1280×780 |

## 仕組み

`scripts/docs-shot.mjs` が次の3段でPNGを作る。ImageMagick等の追加依存はなく、Marpが使うのと同じローカルChromeだけで完結する。

1. プリセット定義から1セル1枚の見本デッキを `.docs-shot/<preset>/` に書き出す
2. ディレクトリをまとめてMarpに渡してPNG化する（Chrome起動は1回）
3. PNGをCSS Gridに並べたHTMLを作り、Chromeヘッドレスの `--screenshot` で1枚に撮る

Chromeは `/Applications/Google Chrome.app` などの既定パスを探す。見つからない環境では `CHROME_PATH` で明示する。

## 見本の内容を変える

すべて `scripts/docs-shot.mjs` の中で完結している。

- **テーマを足した** → `SHOWCASE_THEMES` / `TONES` / `LAYOUTS` の配列に追加する。`SHOWCASE_THEMES` と `LAYOUTS` は `['テーマ名', '短い表紙タイトル(省略可)']` の形式。`SHOWCASE_THEMES` は全件掲載ではなく、各行にレイアウトの異なるテーマを混ぜて選ぶ
- **パターンを足した** → `PATTERN_SLIDES` にスライドのHTMLを追加する（`template/slides.md` から該当スライドを写す）
- **段組・サイズを変えたい** → `PRESETS` の `cols` / `cell`（1枚の表示幅px）/ `gap` / `frame`（枠線の有無）

新しいプリセットを足したら、この表と README の該当箇所にも記載する。

## 注意

- **ユーザーが手動で作成・加工した画像が `docs/` に置かれていることがある**（クロップ版など）。全プリセット一括の `npm run docs-shot` は手動画像も上書きするため、依頼された画像だけをプリセット指定で再生成し、それ以外には触れない。手動画像を上書きしてよいかはユーザーに確認する
- 見本デッキは `paginate: false`。ページ番号は見本には不要
- 出力サイズは `cell` と列数から計算している。1枚の高さは常に16:9
- `.docs-shot/` は生成のたびに作り直され、最後に削除される（.gitignore済み）
