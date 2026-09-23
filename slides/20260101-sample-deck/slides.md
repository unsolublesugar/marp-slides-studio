---
marp: true
theme: base
# テーマ一覧は node scripts/list-themes.mjs で表示、npm run gallery で実物を見比べられる
paginate: true
size: 16:9
html: true
---

<!-- _class: title -->
<!-- _paginate: false -->

<div class="orb a"></div>
<div class="orb b"></div>
<div class="eyebrow"><span class="dot"></span>TECH TALK</div>

# 発表タイトルをここに<br>2行までを目安に

## 〜サブタイトル〜

<div class="accent"></div>

<div class="meta">2026/01/01<br>@your_handle</div>

---

<!-- _class: content -->
<!-- レイアウト: grid-cards — アジェンダ・概要の列挙（2〜4項目） -->

<div class="head"><h1 class="bare">今日話すこと</h1></div>
<div class="body">
<div class="grid-cards cols-2">
  <div class="card"><div class="badge">1</div><div class="txt">1つめのトピック</div></div>
  <div class="card"><div class="badge">2</div><div class="txt">2つめのトピック</div></div>
  <div class="card"><div class="badge">3</div><div class="txt">3つめのトピック</div></div>
  <div class="card"><div class="badge">4</div><div class="txt">4つめのトピック</div></div>
</div>
</div>

---

<!-- _class: section -->
<!-- レイアウト: 章扉スライド -->

<div class="side"></div>
<div class="chapter-num">CHAPTER 01</div>
<h1>章タイトル</h1>
<div class="bar"></div>

---

<!-- _class: content -->
<!-- レイアウト: panel-list — 基本の箇条書き（3〜5項目が目安） -->

<div class="head"><h1 class="bare">基本の箇条書きスライド</h1></div>
<div class="body">
<ul class="panel-list">
  <li>要点を1行で書く。<strong>強調</strong>は1項目1箇所まで</li>
  <li>2行に折り返す場合は50文字程度で収める</li>
  <li>項目数は5つまで。あふれるならスライドを分ける</li>
</ul>
</div>

---

<!-- _class: content middle -->
<!-- レイアウト: middle — 中身が少ないときに .body を上下中央へ寄せる -->

<div class="head"><h1 class="bare">上下中央寄せのスライド</h1></div>
<div class="body">
<ul class="panel-list">
  <li><code>content</code> に <code>middle</code> を足すと、下側に残る余白がなくなる</li>
  <li>見出しは上のまま、<strong>.body の中身だけ</strong>が中央に来る</li>
</ul>
<div class="callout"><strong>使いどころ:</strong> 部品が2〜3個で下が空くスライド。詰まっているスライドには不要</div>
</div>

---

<!-- _class: content -->
<!-- レイアウト: 番号付きヘッダ — 章内のステップ解説に使う -->
<!-- 番号は丸い地の上に乗るので、丸数字ではなく 1 2 3 と書く -->

<div class="head"><div class="num">1</div><h1>番号付き見出しのスライド</h1></div>
<div class="body">
<ul class="panel-list">
  <li>章の中で手順・ステップを追うときは番号付きヘッダを使う</li>
  <li>番号は <code>1</code> <code>2</code> <code>3</code> … と手書きする（丸数字は使わない）</li>
</ul>
</div>

---

<!-- _class: content -->
<!-- レイアウト: stats — 数字の実績を3つ並べる -->

<div class="head"><h1 class="bare">数字で見せるスライド</h1></div>
<div class="body">
<div class="stats">
  <div class="stat-card"><div class="num">140<span class="unit">件</span></div><div class="label">指標のラベル</div></div>
  <div class="stat-card"><div class="num">6<span class="unit">本</span></div><div class="label">指標のラベル</div></div>
  <div class="stat-card"><div class="num">98<span class="unit">%</span></div><div class="label">指標のラベル</div></div>
</div>
<ul class="panel-list">
  <li>数字の下に補足の箇条書きを1〜2項目まで置ける</li>
</ul>
</div>

---

<!-- _class: content -->
<!-- レイアウト: compare — 2案比較。採用側に selected を付ける -->

<div class="head"><h1 class="bare">2案比較のスライド</h1></div>
<div class="body compare">
  <div class="compare-card">
    <div class="tag">案A</div>
    <h3>案Aの名前</h3>
    <p>案Aの説明文。特徴を1〜2文で</p>
  </div>
  <div class="compare-card selected">
    <div class="tag">採用</div>
    <h3>案Bの名前</h3>
    <p>採用案の説明文。決め手を1〜2文で</p>
  </div>
</div>

---

<!-- _class: content -->
<!-- レイアウト: issue-grid — 問題→解決の2x2 -->
<!-- 3件なら issue-grid cols-3 rows-1、2件なら issue-grid rows-1 -->

<div class="head"><h1 class="bare">問題と解決の一覧</h1></div>
<div class="body issue-grid">
  <div class="issue-card"><div class="prob">問題1のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題2のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題3のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題4のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
</div>

---

<!-- _class: content -->
<!-- レイアウト: flow — 横方向のプロセス（3〜5ステップ） -->

<div class="head"><h1 class="bare">プロセスフローのスライド</h1></div>
<div class="body">
<div class="flow">
  <div class="flow-step"><span class="step-label">Step1</span>やること</div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><span class="step-label">Step2</span>やること</div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><span class="step-label">Step3</span>やること</div>
</div>
<div class="callout"><strong>ポイント:</strong> フローの下に補足のコールアウトを置ける</div>
</div>

---

<!-- _class: content -->
<!-- レイアウト: shot-full — スクリーンショット1枚を大きく -->

<div class="head"><h1 class="bare">スクリーンショット全面</h1></div>
<div class="body shot-full">
  <img src="assets/placeholder.png" alt="スクリーンショットの説明">
</div>

---

<!-- _class: content -->
<!-- レイアウト: shot-split — 左テキスト+右スクショ -->

<div class="head"><h1 class="bare">テキストとスクショの2分割</h1></div>
<div class="body shot-split">
<ul class="panel-list">
  <li>左に説明の箇条書き</li>
  <li>右に対応するスクリーンショット</li>
</ul>
<div>
  <img src="assets/placeholder.png" alt="スクリーンショットの説明">
  <div class="shot-cap">キャプションを1行で</div>
</div>
</div>

---

<!-- _class: content -->
<!-- レイアウト: two-col — 汎用2カラム -->

<div class="head"><h1 class="bare">汎用2カラム</h1></div>
<div class="body two-col">
<ul class="panel-list">
  <li>左カラムの内容</li>
</ul>
<ul class="panel-list">
  <li>右カラムの内容</li>
</ul>
</div>

---

<!-- _class: content -->
<!-- レイアウト: learn-grid — まとめ・学びの番号付きリスト（最大8） -->
<!-- 項目は列方向に流れる。4項目なら learn-grid rows-2、6項目なら rows-3 -->
<!-- 全項目が1行に収まるなら oneline を足すと番号がテキストと同じ高さに揃う -->

<div class="head"><h1 class="bare">まとめ・学び</h1></div>
<div class="body">
<div class="learn-grid">
  <div class="learn-item"><div class="n">1</div><div class="t">学び1つめ</div></div>
  <div class="learn-item"><div class="n">2</div><div class="t">学び2つめ</div></div>
  <div class="learn-item"><div class="n">3</div><div class="t">学び3つめ</div></div>
  <div class="learn-item"><div class="n">4</div><div class="t">学び4つめ</div></div>
  <div class="learn-item"><div class="n">5</div><div class="t">学び5つめ</div></div>
  <div class="learn-item"><div class="n">6</div><div class="t">学び6つめ</div></div>
  <div class="learn-item"><div class="n">7</div><div class="t">学び7つめ</div></div>
</div>
</div>

---

<!-- _class: lead -->
<!-- レイアウト: lead — 伝えたいメッセージを1つだけ大きく -->

# 一番伝えたいことを<br>**ここに大きく**書く

補足の一言があればここに

---

<!-- _class: quote -->
<!-- レイアウト: quote — 引用・キーフレーズ -->

> 引用文やキーフレーズを
> ここに置く

<div class="cite">— 出典・発言者名</div>

---

<!-- クラスなし: 素のMarkdown（表・コード）もテーマ済み -->

# 素のMarkdownスライド

| 項目 | 説明 |
| --- | --- |
| 行1 | 表もテーマのスタイルが当たる |
| 行2 | コードも同様 |

```bash
npm run build -- slides/my-deck pdf
```

---

<!-- _class: content reference -->
<!-- レイアウト: reference — 参考リンク -->

<div class="head"><h1 class="bare">参考</h1></div>
<div class="ref-card">
  <div class="title">参考資料のタイトル</div>
  <a class="url" href="https://example.com">example.com</a>
</div>

---

<!-- _class: closing -->
<!-- レイアウト: closing — 締めスライド -->

<div class="orb a"></div>

# ご清聴ありがとうございました

<div class="accent"></div>

@your_handle
