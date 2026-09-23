# Marp / Marpit 固有の制約

プラットフォーム側の変えられない事実。テーマ・レイアウトを書くとき、および描画がおかしいときに参照する。

## 疑似要素・マージン

- **`section::before` は Marpit が装飾用（advanced background）に押さえている**。テーマから疑似要素で全面装飾は描けない。全面装飾は section の `background` に多段グラデーションを重ねて描く（実例: `themes/layout-aurora.css` / `themes/layout-wave.css`）
- **`section > :first-child` に `margin-top: 0 !important` が当たる**。先頭要素を負のマージンで全幅化することはできない。layout-band は section の padding を 0 にして `.head` / `.body` 側に padding を持たせて回避している
- **ページ番号 `section::after` は `padding: inherit` で位置が決まる**。section の padding を変えたら `::after` にも余白を指定し直す

## PDF（Chrome の印刷経路）での描画差

- **`filter: blur()` は PDF で失われる**。装飾はグラデーションのみで構成する（layout-aurora の隅の光は radial-gradient のぼかしなしの階調だけで描いている）
- **`box-shadow` のぼかしも PDF で失われて角張った矩形になる**。base.css は `@media print` で spread のみのリング（`box-shadow: 0 0 0 4px`）に差し替え済み
- 4K で PDF の文字がぼやけて見える場合、テキストはベクターなので原因は**素材PNGの実ピクセル不足**（全画面表示には表示pxの3倍が目安）

## Marp 組み込み default テーマの継承

base.css は Marp の `default` テーマを土台にしている。

- **表のセル背景などは `light-dark()` で持っている**。暗いキャンバスのテーマでは light 側（白）に解決されて反転後の淡色文字が読めなくなるため、`color-scheme: dark` を指定して dark 側に解決させる（実例: layout-aurora）
- シンタックスハイライトは prettylights 変数。base.css が `section pre` で濃色背景向けに差し替え済み

## CLI・プレビュー

- `marp --images png` などの変換で**ローカル画像を参照するには `--allow-local-files` が必要**（付けないと黙って画像が抜ける。`scripts/lib/render.mjs` の `renderDeckDir` は付与済み）
- **VS Code プレビューは `.vscode/settings.json` の `markdown.marp.themes` に登録されたCSSしか解決しない**。`layout-*` レイヤー自体も登録が必要（未登録だと `@import` が解決できない）。CLI ビルドは `--theme-set themes` でディレクトリ丸ごと渡すため再現しない＝プレビューでのみ発覚する
- テーマの `@import` は**必ずカラー→レイアウトの順**。layout 層は base と同じセレクタを後勝ちで上書きするレイヤーのため、順序が逆だと上書きが効かない
