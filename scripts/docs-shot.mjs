#!/usr/bin/env node
// README用のスクリーンショット（docs/*.png）を生成する
//   node scripts/docs-shot.mjs             # 全プリセット
//   node scripts/docs-shot.mjs themes      # 指定プリセットだけ
//
// 手法: 見本デッキをMarpでPNG化 → グリッドHTMLに並べる → Chromeヘッドレスで1枚に撮る。
// 合成にImageMagick等は使わず、Marpが使うのと同じローカルChromeだけで完結させている。
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, fail, pngsIn, prepareWorkDir, renderDeckDir, requireChrome, screenshot } from './lib/render.mjs';

const WORK = join(ROOT, '.docs-shot');
const OUT = join(ROOT, 'docs');

// ---------------------------------------------------------------- 見本スライド

const front = (theme) =>
  `---\nmarp: true\ntheme: ${theme}\npaginate: false\nsize: 16:9\nhtml: true\n---\n\n`;

const titleSlide = (theme, title = '発表タイトルをここに<br>2行までを目安に') =>
  front(theme) +
  `<!-- _class: title -->

<div class="eyebrow"><span class="dot"></span>${theme.toUpperCase()}</div>

# ${title}

## 〜サブタイトル〜

<div class="accent"></div>

<div class="meta">2026/01/01<br>@your_handle</div>
`;

const agendaSlide = (theme) =>
  front(theme) +
  `<!-- _class: content -->

<div class="head"><h1 class="bare">今日話すこと</h1></div>
<div class="body">
<div class="grid-cards cols-2">
  <div class="card"><div class="badge">1</div><div class="txt">1つめのトピック</div></div>
  <div class="card"><div class="badge">2</div><div class="txt">2つめのトピック</div></div>
  <div class="card"><div class="badge">3</div><div class="txt">3つめのトピック</div></div>
  <div class="card"><div class="badge">4</div><div class="txt">4つめのトピック</div></div>
</div>
<ul class="panel-list">
  <li>本文の<strong>強調</strong>もテーマ色に追従する</li>
</ul>
</div>
`;

const toneSlide = (theme, label) =>
  front(theme) +
  `<!-- _class: content -->

<div class="head"><h1 class="bare">${label}（${theme}）</h1></div>
<div class="body">
<div class="grid-cards cols-2">
  <div class="card"><div class="badge">1</div><div class="txt">書体が変わる</div></div>
  <div class="card"><div class="badge">2</div><div class="txt">角丸・影・罫線が変わる</div></div>
  <div class="card"><div class="badge">3</div><div class="txt">配色が変わる</div></div>
  <div class="card"><div class="badge">4</div><div class="txt">レイアウトは全テーマ共通</div></div>
</div>
<ul class="panel-list">
  <li>箇条書きの<strong>強調</strong>もテーマ色に追従する</li>
  <li>front-matter の <code>theme:</code> を変えるだけ</li>
</ul>
<div class="callout"><strong>ポイント:</strong> 同じMarkdownのまま雰囲気だけ差し替えられる</div>
</div>
`;

const PATTERN_SLIDES = [
  `<!-- _class: content -->

<div class="head"><h1 class="bare">今日話すこと</h1></div>
<div class="body">
<div class="grid-cards cols-2">
  <div class="card"><div class="badge">1</div><div class="txt">1つめのトピック</div></div>
  <div class="card"><div class="badge">2</div><div class="txt">2つめのトピック</div></div>
  <div class="card"><div class="badge">3</div><div class="txt">3つめのトピック</div></div>
  <div class="card"><div class="badge">4</div><div class="txt">4つめのトピック</div></div>
</div>
</div>`,
  `<!-- _class: content -->

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
</div>`,
  `<!-- _class: content -->

<div class="head"><h1 class="bare">問題と解決の一覧</h1></div>
<div class="body issue-grid">
  <div class="issue-card"><div class="prob">問題1のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題2のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題3のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
  <div class="issue-card"><div class="prob">問題4のタイトル</div><div class="sol"><span class="arrow">→</span> 解決策を1行で</div></div>
</div>`,
  `<!-- _class: content -->

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
</div>`,
  `<!-- _class: content -->

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
</div>`,
  `<!-- _class: lead -->

# 一番伝えたいことを<br>**ここに大きく書く**

補足の一言があればここに`,
];

const CODE_SLIDES = [
  `<!-- _class: content -->

<div class="head"><h1 class="bare">シェルコマンドの例</h1></div>
<div class="body">

\`\`\`bash
# デプロイ結果を確認する
deploy() {
  local env="\${1:-staging}"
  curl -sS -o /dev/null -w "%{http_code}\\n" \\
    "https://api.example.com/\${env}/health"
}

deploy production   # => 200
\`\`\`

<div class="callout"><strong>ポイント:</strong> コメント・文字列・変数がそれぞれ別の色で読み分けられる</div>
</div>`,
  `<!-- _class: content -->

<div class="head"><h1 class="bare">設定ファイルの例</h1></div>
<div class="body two-col">
<ul class="panel-list">
  <li>言語名を指定すると<strong>自動でハイライト</strong>される</li>
  <li>2カラムに置けば説明と並べられる</li>
  <li>行数は10行程度までが目安</li>
</ul>

\`\`\`json
{
  "name": "my-deck",
  "theme": "navy",
  "paginate": true,
  "size": [1280, 720]
}
\`\`\`

</div>`,
];

const DIFF_SLIDE = `<!-- _class: content -->

<div class="head"><h1 class="bare">差分を見せるスライド</h1></div>
<div class="body">

\`\`\`diff
 section.content .card {
   background: var(--surface);
-  border: 1px solid #dddddd;
-  box-shadow: none;
+  border: var(--card-border);
+  box-shadow: var(--card-shadow);
 }
\`\`\`

<div class="callout"><strong>ポイント:</strong> 追加は緑、削除は赤で全テーマ共通</div>
</div>`;

// ---------------------------------------------------------------- プリセット
// cell: 1枚あたりの表示幅(px)。高さは16:9で自動。frame: カード風の枠線を付ける

// README冒頭の見本。色違いを網羅するのではなく、レイアウト×配色×トーンの
// 組み合わせの幅が一目で伝わるよう、各行にレイアウトの異なるテーマを混ぜる。
// split 系は表紙タイトルが左半分に入るため短いタイトルを添える
const SHORT = '発表タイトルを<br>ここに';
const SHOWCASE_THEMES = [
  ['navy'], ['band-wine'], ['split-forest', SHORT],
  ['wave-sunrise'], ['minimal-slate'], ['aurora-night'],
  ['casual-mint'], ['split-charcoal', SHORT], ['wave-coral'],
  ['chic-ink'], ['band-sunrise'], ['minimal-coral'],
  ['pop-neon'], ['band-pop-soda'], ['split-chic-ink', SHORT],
  ['pastel-sky'], ['business-azure'], ['aurora-neon'],
];

const TONES = [
  ['casual-mint', 'カジュアル'],
  ['pop-neon', 'ポップ'],
  ['chic-ink', 'シック'],
  ['business-azure', 'ビジネス'],
];

// split は表紙タイトルが左半分に入るので、見本も短いタイトルにする
const LAYOUTS = [
  ['band-navy'],
  ['split-charcoal', SHORT],
  ['minimal-slate'],
  ['aurora-night'],
  ['wave-sunrise'],
  ['wave-navy'],
];

// ギャラリーのスクショ用テーマ。色系統チップに全6系統が並ぶよう1系統1テーマ選ぶ
const GALLERY_THEMES = ['wine', 'sunrise', 'forest', 'navy', 'chic-plum', 'charcoal'];

// テーマ切替プレビューのスクショ用。配色・組み合わせの両グループを含める
// （初期表示はテーマ名の辞書順で先頭になる aurora-night）
const PREVIEW_DECK = 'slides/20260101-sample-deck';
const PREVIEW_THEMES = ['aurora-night', 'navy', 'wine', 'casual-mint', 'chic-ink', 'band-navy', 'minimal-slate', 'wave-sunrise'];

const PRESETS = {
  themes: {
    cols: 3, cell: 420, gap: 12, frame: false,
    cells: () => SHOWCASE_THEMES.map(([t, title]) => ({ theme: t, md: titleSlide(t, title) })),
  },
  tones: {
    cols: 2, cell: 636, gap: 12, frame: false,
    cells: () => TONES.map(([t, label]) => ({ theme: t, md: toneSlide(t, label) })),
  },
  // 1行 = 1レイアウト。左に表紙、右に本文を並べて組み方の差を見せる
  layouts: {
    cols: 2, cell: 636, gap: 12, frame: false,
    cells: () => LAYOUTS.flatMap(([t, title]) => [
      { theme: t, md: titleSlide(t, title) },
      { theme: t, md: agendaSlide(t) },
    ]),
  },
  patterns: {
    cols: 3, cell: 430, gap: 12, frame: true,
    cells: () => PATTERN_SLIDES.map((s) => ({ theme: 'navy', md: front('navy') + s + '\n' })),
  },
  'code-block': {
    cols: 2, cell: 652, gap: 12, frame: true,
    cells: () => CODE_SLIDES.map((s) => ({ theme: 'navy', md: front('navy') + s + '\n' })),
  },
  'code-block-diff': {
    cols: 2, cell: 652, gap: 12, frame: true,
    cells: () => ['navy', 'forest'].map((t) => ({ theme: t, md: front(t) + DIFF_SLIDE + '\n' })),
  },
  // ツールが生成する実際のページをそのまま撮るプリセット（グリッド合成はしない）
  gallery: {
    shoot(out) {
      // process.execPath: PATH の node ではなく、実行中と同じ Node で確実に起動する
      execFileSync(process.execPath, ['scripts/theme-gallery.mjs', ...GALLERY_THEMES, '--no-open'], {
        cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'],
      });
      // loading="lazy" の画像を読み終えてから撮る
      screenshot(join(ROOT, '.gallery', 'index.html'), out, 1280, 960, 15000);
      return '1280x960';
    },
  },
  'theme-preview': {
    shoot(out) {
      const work = join(ROOT, PREVIEW_DECK, '.theme-preview');
      execFileSync(process.execPath, ['scripts/theme-preview.mjs', PREVIEW_DECK, ...PREVIEW_THEMES, '--no-open'], {
        cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'],
      });
      try {
        // iframe 内のデッキHTMLの読み込みを待ってから撮る
        screenshot(join(work, 'index.html'), out, 1280, 780, 15000);
      } finally {
        // スクショ生成の副作用で作例デッキ直下に生成物を残さない
        rmSync(work, { recursive: true, force: true });
      }
      return '1280x780';
    },
  },
};

// ---------------------------------------------------------------- 生成

function render(name) {
  const preset = PRESETS[name];

  if (preset.shoot) {
    mkdirSync(OUT, { recursive: true });
    const out = join(OUT, `${name}.png`);
    const size = preset.shoot(out);
    console.log(`docs/${name}.png  ${size}`);
    return;
  }

  const dir = join(WORK, name);
  prepareWorkDir(dir);

  const cells = preset.cells();
  cells.forEach((cell, i) => {
    writeFileSync(join(dir, `${String(i).padStart(2, '0')}-${cell.theme}.md`), cell.md);
  });

  // Marpはディレクトリを渡すと1回のChrome起動でまとめてPNG化する
  renderDeckDir(dir);

  const pngs = pngsIn(dir);
  if (pngs.length !== cells.length) {
    fail(`${name}: PNGの数が合わない（期待 ${cells.length} / 実際 ${pngs.length}）`);
  }

  const { cols, cell, gap, frame } = preset;
  const cellH = Math.round((cell * 9) / 16);
  const rows = Math.ceil(pngs.length / cols);
  const border = frame ? 1 : 0;
  const pad = frame ? gap : 0;
  const width = cols * (cell + border * 2) + (cols - 1) * gap + pad * 2;
  const height = rows * (cellH + border * 2) + (rows - 1) * gap + pad * 2;

  const html = `<!doctype html><meta charset="utf-8"><style>
html, body { margin: 0; padding: 0; background: #fff; }
.grid {
  display: grid;
  grid-template-columns: repeat(${cols}, ${cell}px);
  gap: ${gap}px;
  padding: ${pad}px;
  width: max-content;
}
img {
  display: block;
  width: ${cell}px;
  height: ${cellH}px;
  ${frame ? 'border: 1px solid #e5e7eb; border-radius: 8px;' : ''}
}
</style><div class="grid">${pngs.map((p) => `<img src="${p}">`).join('')}</div>`;
  const htmlPath = join(dir, 'grid.html');
  writeFileSync(htmlPath, html);

  mkdirSync(OUT, { recursive: true });
  const out = join(OUT, `${name}.png`);
  screenshot(htmlPath, out, width, height);

  console.log(`docs/${name}.png  ${width}x${height}  (${pngs.length}枚 / ${cols}列)`);
}

// ---------------------------------------------------------------- entry

requireChrome();

const targets = process.argv.slice(2);
const unknown = targets.filter((t) => !PRESETS[t]);
if (unknown.length) {
  console.error(`不明なプリセット: ${unknown.join(', ')}`);
  fail(`利用できるプリセット: ${Object.keys(PRESETS).join(' / ')}`);
}

// 失敗時も作業ディレクトリを残さない（fail() の exit でも発火する）
process.on('exit', () => rmSync(WORK, { recursive: true, force: true }));

for (const name of targets.length ? targets : Object.keys(PRESETS)) {
  render(name);
}
