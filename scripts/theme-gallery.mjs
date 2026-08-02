#!/usr/bin/env node
// 全テーマの実物を1ページで見比べるギャラリーを作る
//   npm run gallery                    # 全テーマ（生成後にブラウザで開く）
//   npm run gallery -- sunrise coral   # テーマを絞る
//   npm run gallery -- --no-open       # 開かずにパスだけ出す
//
// 見本を二重管理しないよう、カタログ template/slides.md を theme だけ差し替えて
// 全レイアウトパターンをPNG化する。一覧は通常テーマごとに代表4枚だけを表示し、
// 「全パターンを表示」で残りを展開できる。画像はクリックで原寸表示。
import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, pickThemes, prepareWorkDir, renderDeckDir, requireChrome, resolveVars } from './lib/render.mjs';

const WORK = join(ROOT, '.gallery');

// ---------------------------------------------------------------- 色系統の判定
// 名前ではなく、テーマの実体（解決済みの --primary の色相・彩度）から系統を導く。
// 新テーマは自動で正しい系統に入り、名前ベース判定の「静かな素通り」を避ける。

const FAMILIES = [
  ['red', 'レッド・ピンク'],
  ['orange', 'オレンジ・イエロー'],
  ['green', 'グリーン'],
  ['blue', 'ブルー'],
  ['purple', 'パープル'],
  ['mono', 'モノトーン'],
];

// チップに添える系統の代表色（見出し用。テーマの実色は各行の swatch で見せる）
const FAMILY_DOT = {
  red: '#C74A5C',
  orange: '#E08A2E',
  green: '#4E9367',
  blue: '#2E6E9E',
  purple: '#7C5CB0',
  mono: '#6B7078',
};

// テーマCSS内の色は #RRGGBB か var() 参照（1段）だけを想定する
const cssColor = (vars, name) => {
  let c = (vars[name] ?? '').trim();
  const ref = c.match(/^var\((--[\w-]+)\)$/);
  if (ref) c = (vars[ref[1]] ?? '').trim();
  const m = c.match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const familyOf = (vars) => {
  const rgb = cssColor(vars, '--primary');
  if (!rgb) return 'mono';
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  // 彩度が低い主要色はモノトーン扱い（charcoal / chic-ink など）
  if (d === 0 || d / max < 0.28) return 'mono';
  let h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (h < 20 || h >= 330) return 'red';
  if (h < 70) return 'orange';
  if (h < 185) return 'green'; // ティール・ミント（〜185°）は緑系に含める
  if (h < 260) return 'blue';
  return 'purple';
};

// ---------------------------------------------------------------- 見本デッキ

const TEMPLATE = readFileSync(join(ROOT, 'template', 'slides.md'), 'utf8');

// スクショ系パターンが参照する assets/placeholder.png の代わりを作業ディレクトリに置く
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="#E3E7EB"/>
  <rect x="24" y="24" width="752" height="60" rx="8" fill="#CBD2D9"/>
  <rect x="24" y="108" width="480" height="318" rx="8" fill="#F4F6F8"/>
  <rect x="528" y="108" width="248" height="150" rx="8" fill="#CBD2D9"/>
  <rect x="528" y="276" width="248" height="150" rx="8" fill="#CBD2D9"/>
  <text x="400" y="240" font-family="sans-serif" font-size="28" fill="#8A939C" text-anchor="middle">screenshot</text>
</svg>`;

const deck = (theme) =>
  TEMPLATE.replace(/^theme: base$/m, `theme: ${theme}`).replaceAll('assets/placeholder.png', 'assets/placeholder.svg');

// 各スライドの <!-- レイアウト: xxx --> 注釈をラベルに使う（なければ _class、それもなければ素のMarkdown）
const LABELS = TEMPLATE.split(/\n---\n/)
  .slice(1)
  .map((slide) => {
    const layout = slide.match(/<!--\s*レイアウト:\s*(.+?)\s*(?:—|-->)/);
    if (layout) return layout[1].trim();
    const cls = slide.match(/<!--\s*_class:\s*([^-]+?)\s*-->/);
    return cls ? cls[1].trim() : '素のMarkdown';
  });

// 折りたたみ時に見せる代表4枚（表紙 / 章扉 / 箇条書き / コード）。見つからなければ先頭4枚
const REP_LABELS = ['title', '章扉スライド', 'panel-list', '素のMarkdown'];
const repIndexes = REP_LABELS.map((l) => LABELS.indexOf(l));
const reps = new Set(repIndexes.every((i) => i >= 0) ? repIndexes : [0, 1, 2, 3]);

// ---------------------------------------------------------------- 生成

requireChrome();

const args = process.argv.slice(2);
const noOpen = args.includes('--no-open');
const themes = pickThemes(args.filter((a) => !a.startsWith('--')));

// WORK は生成後も消さない。index.html が中のPNGを相対参照するため（.gitignore済み）
prepareWorkDir(WORK);
mkdirSync(join(WORK, 'assets'), { recursive: true });
writeFileSync(join(WORK, 'assets', 'placeholder.svg'), PLACEHOLDER_SVG);
themes.forEach((t) => writeFileSync(join(WORK, `${t.name}.md`), deck(t.name)));

console.log(`${themes.length}テーマ × ${LABELS.length}枚を書き出しています…`);
renderDeckDir(WORK);

// テーマ名・説明・ラベルは themes/*.css のコメント由来なのでHTMLに埋め込む前にエスケープする
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shots = (name) =>
  readdirSync(WORK)
    .filter((f) => f.startsWith(`${name}.`) && f.endsWith('.png'))
    .sort();

// テーマごとの色系統と、名前の横に出す色見本（primary / accent の実色）
const meta = new Map(
  themes.map((t) => {
    const vars = resolveVars(t.name);
    const hex = (rgb) => (rgb ? `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}` : null);
    return [t.name, {
      family: familyOf(vars),
      swatch: [hex(cssColor(vars, '--primary')), hex(cssColor(vars, '--accent'))].filter(Boolean),
    }];
  }),
);

const famCount = new Map(FAMILIES.map(([id]) => [id, 0]));
for (const { family } of meta.values()) famCount.set(family, famCount.get(family) + 1);

const rows = themes
  .map((t) => {
    const imgs = shots(t.name)
      .map((f, i) => {
        const label = esc(LABELS[i] ?? '');
        return `<figure${reps.has(i) ? '' : ' class="extra"'}><a href="${esc(f)}" target="_blank" rel="noopener"><img src="${esc(f)}" alt="${esc(t.name)} ${label}" loading="lazy"></a><figcaption>${label}</figcaption></figure>`;
      })
      .join('');
    const m = meta.get(t.name);
    const dots = m.swatch.map((c) => `<i class="dot" style="background:${esc(c)}"></i>`).join('');
    return `<section class="theme" data-name="${esc(t.name)}" data-kind="${esc(t.kind)}" data-family="${esc(m.family)}">
  <h2><span class="swatch">${dots}</span>${esc(t.name)} <span class="kind ${esc(t.kind)}">${t.kind === 'combo' ? '組み合わせ' : '配色'}</span> <button class="more">全${LABELS.length}パターンを表示</button></h2>
  <p class="desc">${esc(t.desc)}</p>
  <div class="shots">${imgs}</div>
</section>`;
  })
  .join('\n');

const html = `<!doctype html><html lang="ja"><meta charset="utf-8">
<title>テーマギャラリー</title>
<style>
  :root { color-scheme: light dark;
    --line: color-mix(in srgb, CanvasText 14%, transparent);
    --line-strong: color-mix(in srgb, CanvasText 32%, transparent);
    --fill: color-mix(in srgb, CanvasText 7%, transparent);
    --fill-strong: color-mix(in srgb, CanvasText 12%, transparent);
  }
  body { margin: 0; padding: 0 32px 64px; background: Canvas; color: CanvasText;
         font-family: system-ui, -apple-system, 'Hiragino Sans', sans-serif; }
  header { position: sticky; top: 0; z-index: 1; margin: 0 -32px; padding: 18px 32px 14px;
           background: color-mix(in srgb, Canvas 88%, transparent);
           backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
           border-bottom: 1px solid var(--line);
           box-shadow: 0 1px 8px color-mix(in srgb, CanvasText 6%, transparent); }
  .bar { display: flex; gap: 12px; align-items: baseline; margin-bottom: 12px; }
  h1 { font-size: 19px; margin: 0; }
  .hint { margin-left: auto; font-size: 12px; opacity: 0.55; }
  .tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; }
  input[type="search"] { padding: 7px 14px; font-size: 13px; min-width: 240px;
    border: 1px solid var(--line-strong); border-radius: 999px;
    background: Canvas; color: CanvasText; outline: none; transition: border-color 0.15s; }
  input[type="search"]:focus { border-color: color-mix(in srgb, CanvasText 60%, transparent); }
  .count { opacity: 0.6; font-weight: 400; }
  .sep { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; cursor: pointer;
          border: 1px solid var(--line-strong); border-radius: 999px; font-size: 12px;
          user-select: none; background: Canvas; color: CanvasText;
          transition: background 0.15s, border-color 0.15s, opacity 0.15s; }
  .chip:hover { background: var(--fill); }
  .chip:has(input:checked) { background: var(--fill-strong);
          border-color: color-mix(in srgb, CanvasText 50%, transparent); }
  .chip:not(:has(input:checked)):not(button) { opacity: 0.4; }
  /* チェックボックスは視覚的にだけ隠す（display:none だとキーボード・支援技術で操作不能になる） */
  .chip input { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
                border: 0; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }
  .chip { position: relative; }
  .chip:focus-visible, .chip:has(input:focus-visible) {
          outline: 2px solid color-mix(in srgb, CanvasText 55%, transparent); outline-offset: 1px; }
  .fams { margin-top: 10px; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; flex: none;
         border: 1px solid color-mix(in srgb, CanvasText 20%, transparent); }
  button { padding: 5px 12px; font-size: 12px; cursor: pointer;
    border: 1px solid var(--line-strong); border-radius: 999px;
    background: Canvas; color: CanvasText; transition: background 0.15s; }
  button:hover { background: var(--fill); }
  #reset-top[hidden] { display: none; }
  .theme { padding: 26px 0 10px; border-bottom: 1px solid var(--line); }
  .theme h2 { display: flex; align-items: center; gap: 8px; font-size: 16px; margin: 0 0 4px;
              font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .swatch { display: inline-flex; gap: 3px; }
  .kind { font-size: 11px; font-weight: 400; padding: 2px 9px; border-radius: 999px; }
  .kind.color { background: color-mix(in srgb, #2E6E9E 14%, transparent);
                color: color-mix(in srgb, #2E6E9E 75%, CanvasText); }
  .kind.combo { background: color-mix(in srgb, #7C5CB0 14%, transparent);
                color: color-mix(in srgb, #7C5CB0 75%, CanvasText); }
  .more { font-family: system-ui, -apple-system, 'Hiragino Sans', sans-serif; font-weight: 400;
          margin-left: auto; opacity: 0.75; }
  .more:hover { opacity: 1; }
  .desc { margin: 0 0 12px; font-size: 13px; opacity: 0.7; }
  .shots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .shots figure { margin: 0; }
  .theme:not(.open) .shots figure.extra { display: none; }
  .shots img { display: block; width: 100%; aspect-ratio: 16 / 9;
               border: 1px solid var(--line); border-radius: 8px;
               transition: box-shadow 0.15s, transform 0.15s; }
  .shots a:hover img { box-shadow: 0 3px 14px color-mix(in srgb, CanvasText 18%, transparent);
                       transform: translateY(-1px); }
  .shots figcaption { margin-top: 4px; font-size: 11px; opacity: 0.6;
                      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .theme[hidden], .empty[hidden] { display: none; }
  .empty { margin: 48px 0; padding: 28px; text-align: center; font-size: 14px; line-height: 1.9;
           border: 1px dashed color-mix(in srgb, CanvasText 25%, transparent); border-radius: 12px; }
  .empty b { display: block; font-size: 15px; margin-bottom: 6px; }
  .empty button { margin-top: 12px; padding: 6px 16px; font-size: 13px; }
</style>
<header>
  <div class="bar">
    <h1>テーマギャラリー <span class="count" id="count">${themes.length}件</span></h1>
    <span class="hint">通常は代表4枚・画像クリックで原寸表示・<kbd>/</kbd> で検索</span>
  </div>
  <div class="tools">
    <input type="search" id="q" placeholder="テーマ名・説明で絞り込み" autofocus>
    <label class="chip"><input type="checkbox" class="k" value="color" checked>配色</label>
    <label class="chip"><input type="checkbox" class="k" value="combo" checked>組み合わせ</label>
    <span class="sep"></span>
    <button id="toggle-all">すべて展開</button>
    <button id="reset-top" hidden>絞り込みを解除</button>
  </div>
  <div class="tools fams">
    ${FAMILIES.filter(([id]) => famCount.get(id) > 0).map(
      ([id, label]) =>
        `<label class="chip fam" title="クリックでオン/オフ・ダブルクリックでこの系統だけ表示"><input type="checkbox" class="f" value="${id}" checked><i class="dot" style="background:${FAMILY_DOT[id]}"></i>${label} <span class="count">${famCount.get(id)}</span></label>`,
    ).join('\n    ')}
  </div>
</header>
<p class="empty" hidden>
  <b>表示できるテーマがありません</b>
  <span id="why"></span>
  <br><button id="reset">絞り込みを解除</button>
</p>
${rows}
<script>
  const q = document.getElementById('q');
  const kinds = [...document.querySelectorAll('.k')];
  const fams = [...document.querySelectorAll('.f')];
  const items = [...document.querySelectorAll('.theme')];
  const empty = document.querySelector('.empty');
  const why = document.getElementById('why');
  const count = document.getElementById('count');
  const toggleAll = document.getElementById('toggle-all');
  const TOTAL = ${LABELS.length};
  const setOpen = (el, open) => {
    el.classList.toggle('open', open);
    el.querySelector('.more').textContent = open ? '代表4枚に戻す' : '全' + TOTAL + 'パターンを表示';
  };
  const apply = () => {
    const term = q.value.trim().toLowerCase();
    const on = kinds.filter((k) => k.checked).map((k) => k.value);
    const onFam = fams.filter((f) => f.checked).map((f) => f.value);
    let shown = 0;
    for (const el of items) {
      const text = (el.dataset.name + ' ' + el.querySelector('.desc').textContent).toLowerCase();
      el.hidden =
        !on.includes(el.dataset.kind) ||
        !onFam.includes(el.dataset.family) ||
        (term && !text.includes(term));
      if (!el.hidden) shown++;
    }
    empty.hidden = shown > 0;
    document.getElementById('reset-top').hidden =
      !term && on.length === kinds.length && onFam.length === fams.length;
    count.textContent = shown === items.length ? shown + '件' : shown + ' / ' + items.length + '件';
    why.textContent = !on.length
      ? '「配色」と「組み合わせ」の両方がオフになっています。どちらかを選んでください。'
      : !onFam.length
        ? 'すべての色系統がオフになっています。どれかを選んでください。'
        : term
          ? '「' + q.value.trim() + '」に一致するテーマがありません。'
          : '条件に一致するテーマがありません。';
  };
  q.addEventListener('input', apply);
  kinds.forEach((k) => k.addEventListener('change', apply));
  fams.forEach((f) => {
    f.addEventListener('change', apply);
    // ダブルクリックでその系統だけ表示（すでに単独ならすべてに戻す）
    f.closest('.fam').addEventListener('dblclick', (e) => {
      e.preventDefault();
      const solo = f.checked && fams.every((o) => (o === f) === o.checked);
      fams.forEach((o) => { o.checked = solo || o === f; });
      apply();
    });
  });
  const reset = () => {
    q.value = '';
    kinds.forEach((k) => { k.checked = true; });
    fams.forEach((f) => { f.checked = true; });
    apply();
  };
  document.getElementById('reset').addEventListener('click', reset);
  document.getElementById('reset-top').addEventListener('click', reset);
  // "/" で検索へフォーカス、検索中の Esc はクリア
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; apply(); }
  });
  items.forEach((el) =>
    el.querySelector('.more').addEventListener('click', () => setOpen(el, !el.classList.contains('open'))),
  );
  toggleAll.addEventListener('click', () => {
    const openAll = items.some((el) => !el.classList.contains('open'));
    items.forEach((el) => setOpen(el, openAll));
    toggleAll.textContent = openAll ? 'すべて閉じる' : 'すべて展開';
  });
</script>
</html>`;

const out = join(WORK, 'index.html');
writeFileSync(out, html);
console.log(`\n${out}`);

if (!noOpen) {
  try {
    if (process.platform === 'win32') {
      // start は cmd.exe の組み込みコマンド。空白入りパス対策でシェル文字列として渡す（第1引数はタイトル枠）
      execSync(`start "" "${out}"`, { stdio: 'ignore' });
    } else {
      execFileSync(process.platform === 'darwin' ? 'open' : 'xdg-open', [out], { stdio: 'ignore' });
    }
  } catch {
    console.log('（ブラウザを開けませんでした。上のパスを直接開いてください）');
  }
}
