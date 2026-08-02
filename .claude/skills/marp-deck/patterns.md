# レイアウトパターンカタログ

すべて themes/base.css に定義済み。スライドは以下のパターンの組み合わせで作り、独自のHTML構造を発明しない。実際に描画された見た目は template/slides.md をビルドして確認できる。

## スライドクラス（`<!-- _class: ... -->`）

| クラス | 用途 |
| --- | --- |
| `title` | 表紙。グラデーション背景+装飾オーブ |
| `section` | 章扉。CHAPTER番号+右側の斜めパネル |
| `content` | 通常コンテンツ。下記の部品を `.body` 内に置く |
| `content middle` | 同上＋`.body` の中身を上下中央に（項目が少なく下が空くとき） |
| `content reference` | 参考リンク（中央寄せ） |
| `lead` | メッセージ1つを大きく中央に |
| `quote` | 引用・キーフレーズ |
| `closing` | 締め（Thank you） |
| （クラスなし） | 素のMarkdown。表・コード・箇条書きにテーマ適用済み |

## content スライドの構造

```html
<!-- _class: content -->
<div class="head"><h1 class="bare">見出し</h1></div>          <!-- 通常見出し -->
<div class="head"><div class="num">①</div><h1>見出し</h1></div> <!-- 番号付き見出し -->
<div class="body"> ...部品... </div>
```

`.body` は残りの高さを常に占めるため、部品が2〜3個だと下半分が空く。そのときは `middle` を足して上下中央に寄せる（見出しは上のまま）。部品が縦にいっぱい入るスライドでは見た目が変わらないので付けなくてよい。

```html
<!-- _class: content middle -->
```

`two-col` / `compare` / `issue-grid` の `.body` にも効く（カード列がストレッチせず、内容の高さのまま中央に来る）。

見出しの高さぶんだけスライド全体では沈んで見えるので、`--middle-pad-bottom`（既定88px）の半分だけ持ち上げて視覚的な中央に合わせている。上下位置を詰めたい／緩めたいときはこの値を調整する。

## .body 内に置ける部品

部品を縦に並べたときの間隔は `.body` 側（`--stack-gap`、既定20px）で自動的に付く。スライド側で `margin` を足す必要はない。

### panel-list — 基本の箇条書き（3〜5項目）
```html
<ul class="panel-list"><li>要点</li>...</ul>
```

### grid-cards — アジェンダ・要素列挙（cols-2 / cols-3）
```html
<div class="grid-cards cols-2">
  <div class="card"><div class="badge">1</div><div class="txt">内容</div></div>
</div>
```
badge には数字のほか「!」「→」も使える（問題提起→帰結の流れ）。

### stats — 数値実績3つ横並び
```html
<div class="stats">
  <div class="stat-card"><div class="num">140<span class="unit">件</span></div><div class="label">ラベル</div></div>
</div>
```

### compare — 2案比較。採用側に `selected`
```html
<div class="body compare">
  <div class="compare-card"><div class="tag">案A</div><h3>名前</h3><p>説明</p></div>
  <div class="compare-card selected"><div class="tag">採用</div><h3>名前</h3><p>説明</p></div>
</div>
```
カード内に `<img>` を置くと比較スクショになる（max-height 240px）。

### issue-grid — 問題→解決の2x2
```html
<div class="body issue-grid">
  <div class="issue-card"><div class="prob">問題</div><div class="sol"><span class="arrow">→</span> 解決</div></div>
</div>
```
4件に届かないときは列数・行数を指定する（3件なら `issue-grid cols-3 rows-1`、2件なら `issue-grid rows-1`）。指定しないと空セルが残る。

### flow — 横方向プロセス（3〜5ステップ）
```html
<div class="flow">
  <div class="flow-step"><span class="step-label">Step1</span>説明</div>
  <div class="flow-arrow">→</div>
  ...
</div>
```
step-label は省略可（1行ステップになる）。

### shot-full / shot-split — スクリーンショット
```html
<div class="body shot-full"><img src="assets/x.png" alt="..."></div>

<div class="body shot-split">
  <ul class="panel-list">...</ul>
  <div><img src="assets/x.png" alt="..."><div class="shot-cap">キャプション</div></div>
</div>
```
左カラムに部品を複数積むときは two-col と同じく `div` でラップする（`--stack-gap` の間隔が付く）。`.shot-cap` はこの間隔の対象外で、画像に添う10pxのまま。キャプションにリンクを置くとキャプション色＋下線で出る。

スクショは縮小されて載るので、説明したいUIが判別できる大きさで撮る。ページ全体を撮ると細部が潰れるため、ブラウザ幅を狭めて該当箇所だけを写す。

### two-col — 汎用2カラム
```html
<div class="body two-col"> <div>左</div> <div>右</div> </div>
```
カラムに部品を複数積むときは上記のように `div` でラップする（`--stack-gap` の間隔が付く）。カラムが `<ul class="panel-list">` 1つだけなら直接置いてよい（リストは自前の行間を持つ）。

### callout — 強調ボックス
```html
<div class="callout"><strong>ポイント:</strong> 本文</div>
```

### learn-grid — まとめの番号付きリスト（縦2列、最大8項目）
```html
<div class="learn-grid">
  <div class="learn-item"><div class="n">1</div><div class="t">学び</div></div>
</div>
```
項目は列方向に流れる（8項目なら左列に1〜4、右列に5〜8）。8項目未満のときは行数を指定しないと左列だけが埋まるので、4項目なら `learn-grid rows-2`、6項目なら `learn-grid rows-3` を使う。

番号は折り返しを想定して上寄せになっている。全項目が1行に収まるときは `oneline` を足すと、番号がテキストと同じ高さ（上下中央）に揃う（例: `learn-grid rows-2 oneline`）。1項目でも2行になるなら付けない。

### ref-card — 参考リンク（reference スライド内）
```html
<div class="ref-card">
  <div class="title">資料タイトル</div>
  <a class="url" href="https://...">表示URL</a>
</div>
```

## title / section / closing の構造

template/slides.md の該当スライドをそのままコピーして文言を差し替える。構造（orb, eyebrow, accent, meta / side, chapter-num, bar）は変更しない。

章タイトルは既定で560pxを上限に自動折り返しされる。改行位置を `<br>` で自分で決めたい長いタイトルは、意図しない位置での折り返しを止める:

```html
<h1 style="max-width:none; white-space:nowrap;">Claude Designフェーズ<br>での意思決定</h1>
```

1行が長すぎると右の斜めパネルに重なるため、この指定を使ったらPNGで必ず確認する（目安: 1行20文字程度まで）。
