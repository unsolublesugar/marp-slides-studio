#!/usr/bin/env node
// テーマの配色を機械的に検査する（コントラスト比）
//   npm run theme-check              # 全テーマ
//   npm run theme-check -- sunrise   # テーマを絞る
//
// 目視では拾いきれない「濃色パネル上の小さいラベル」などを数値で洗い出す。
// あわせて .vscode/settings.json へのテーマ登録漏れも検査する。
// 閾値割れ・登録漏れがあれば終了コード1。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, THEMES_DIR, listThemes, pickThemes, resolveVars } from './lib/render.mjs';

// ---- 検査する「文字色 × 地色」と必要なコントラスト比 ----
// 本文サイズは4.5、見出し・表紙など大きい文字は3.0（WCAG AA）
// base.css に新しい「文字色 × 地色」の組を足したら、ここにも1行足す。
// group: 'hero' は --primary を地とみなす表紙の検査（淡色表紙のテーマでは対象外）
const PAIRS = [
  { label: '本文カード', fg: 'var(--gray-900)', bg: 'var(--surface)', need: 4.5 },
  { label: '補助テキスト', fg: 'var(--gray-700)', bg: 'var(--surface)', need: 4.5 },
  { label: 'キャプション', fg: 'var(--gray-500)', bg: 'var(--white)', need: 4.5 },
  { label: '見出し', fg: 'var(--primary)', bg: 'var(--white)', need: 4.5 },
  { label: 'codeチップ', fg: 'var(--primary-dark)', bg: 'var(--gray-100)', need: 4.5 },
  { label: '数値カードのラベル', fg: 'var(--on-primary-faint)', bg: 'var(--primary)', need: 4.5 },
  { label: 'バッジの数字', fg: 'var(--white)', bg: 'var(--primary)', need: 4.5 },
  { label: '比較カードのタグ', fg: 'var(--white)', bg: 'var(--primary)', need: 4.5 },
  { label: '参考リンクのURL', fg: 'var(--white)', bg: 'var(--primary)', need: 4.5 },
  { label: '比較カードの見出し', fg: 'var(--primary)', bg: 'var(--accent-light)', need: 4.5 },
  { label: 'コールアウト本文', fg: 'var(--primary-dark)', bg: 'var(--accent-light)', need: 4.5 },
  { label: 'コールアウト強調', fg: 'var(--primary)', bg: 'var(--accent-light)', need: 4.5 },
  { label: '章番号', fg: 'var(--accent-ink)', bg: 'var(--bg-alt)', need: 3.0 },
  { label: '表紙ラベル', fg: 'var(--on-hero-accent)', bg: 'var(--primary)', need: 3.0, group: 'hero' },
  { label: '表紙サブタイトル', fg: 'var(--on-primary-sub)', bg: 'var(--primary)', need: 3.0, group: 'hero' },
  { label: '表紙メタ', fg: 'var(--on-primary-muted)', bg: 'var(--primary)', need: 3.0, group: 'hero' },
];

// コードハイライトは濃色パネルの上に乗るので個別に6:1を求める。
// 対象トークンは base.css の --code-*（--code-bg を除く）から自動で拾う
const CODE_TOKENS = Object.keys(resolveVars('base')).filter((k) => k.startsWith('--code-') && k !== '--code-bg');
const CODE_MIN = 6.0;

// ---------------------------------------------------------------- 色の解決

// base: 半透明色を合成する下地。文字色は乗る面の色を渡す（白地合成のままだと、
// 濃色面に乗る半透明文字が実際より明るく評価され、閾値割れを見逃す）
function toRgb(value, vars, depth = 0, base = [255, 255, 255]) {
  if (!value || depth > 8) return null;
  const v = value.trim();
  const ref = v.match(/^var\((--[\w-]+)(?:\s*,\s*(.+))?\)$/);
  if (ref) return toRgb(vars[ref[1]] ?? ref[2], vars, depth + 1, base);
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16));
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(',').map(parseFloat);
    const a = p[3] ?? 1;
    return p.slice(0, 3).map((c, i) => Math.round(c * a + base[i] * (1 - a)));
  }
  return null;
}

const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---------------------------------------------------------------- 実行

const themes = pickThemes(process.argv.slice(2));

const issues = [];
for (const { name, imports } of themes) {
  const vars = resolveVars(name);

  // 暗いキャンバス（layout-aurora）は面が rgba で、白地合成の近似では正しく測れないため
  // PAIRS は検査対象外。コードトークンだけ検査する
  const skipPairs = imports.includes('layout-aurora');
  // 表紙が淡色のテーマ（pastel 系など）は --on-primary-* に濃色文字を入れる。
  // 表紙の文字側が濃色なら「--primary を地とみなす」hero の検査は前提が逆転しているので対象外
  // （--hero-bg はグラデーションで輝度を測れないため、文字側の色で判定する）
  const onHeroLum = luminance(toRgb('var(--on-primary-sub)', vars) ?? [255, 255, 255]);
  const skipHero = onHeroLum < 0.5;

  if (!skipPairs) {
    for (const { label, fg, bg, need, group } of PAIRS) {
      if (skipHero && group === 'hero') continue;
      const b = toRgb(bg, vars);
      const a = b ? toRgb(fg, vars, 0, b) : null; // 半透明の文字色は地色に合成してから測る
      if (!a || !b) continue;
      const r = contrast(a, b);
      if (r < need) issues.push({ name, label, r, need });
    }
  }

  const codeBg = toRgb(vars['--code-bg'] ?? 'var(--primary-dark)', vars);
  for (const token of CODE_TOKENS) {
    const c = codeBg ? toRgb(`var(${token})`, vars, 0, codeBg) : null;
    if (!c || !codeBg) continue;
    const r = contrast(c, codeBg);
    if (r < CODE_MIN) issues.push({ name, label: `コード ${token.replace('--code-', '')}`, r, need: CODE_MIN });
  }
}

// ---- .vscode/settings.json への登録漏れ（layout-* レイヤー含む全CSSが対象） ----
// 未登録だとVS Codeプレビューでだけ @import が解決できず、発見が遅れる
const settings = JSON.parse(readFileSync(join(ROOT, '.vscode', 'settings.json'), 'utf8'));
const registered = new Set(settings['markdown.marp.themes'] ?? []);
const unregistered = readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith('.css'))
  .filter((f) => !registered.has(`./themes/${f}`));

// ---- README のテーマ数表記と実数の照合 ----
// 「テーマN種」= base を除いた数、「名前はN個」= base 込みの数。
// README に件数を書くのはこの2表現だけにし、増減したらここで検出する。
// 表現自体が消えたり表記が変わった場合も検査が空振りしないよう、出現ゼロも失敗にする
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const allNames = listThemes();
const nameCount = allNames.length; // base 込み
const themeCount = allNames.filter((t) => t.name !== 'base').length; // base は navy のエイリアス
const staleDocs = [];
const checkCounts = (pattern, expected, label) => {
  const found = [...readme.matchAll(pattern)];
  if (!found.length) staleDocs.push(`README に「${label}」の表現が見つからない（表記を変えたらこの検査も更新する）`);
  for (const m of found) {
    if (Number(m[1]) !== expected) staleDocs.push(`README「${m[0]}」（実際は${expected}）`);
  }
};
checkCounts(/テーマ(\d+)種/g, themeCount, 'テーマN種');
checkCounts(/名前は(\d+)個/g, nameCount, '名前はN個');

if (!issues.length && !unregistered.length && !staleDocs.length) {
  console.log(`${themes.length}テーマ、閾値割れなし（settings.json の登録・READMEのテーマ数も一致）`);
  process.exit(0);
}

if (issues.length) {
  issues.sort((a, b) => a.r - b.r);
  console.log(`閾値を割る組み合わせ: ${issues.length}件\n`);
  for (const i of issues) {
    console.log(`${i.r.toFixed(2).padStart(5)} (要${i.need})  ${i.name.padEnd(16)} ${i.label}`);
  }
  console.log('\n色を直したら npm run gallery で実物も確認する');
}
if (unregistered.length) {
  console.log(`\n.vscode/settings.json の markdown.marp.themes に未登録: ${unregistered.join(', ')}`);
}
if (staleDocs.length) {
  console.log(`\nドキュメントのテーマ数が実数と不一致:\n  ${staleDocs.join('\n  ')}`);
}
process.exit(1);
