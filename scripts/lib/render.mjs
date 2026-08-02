// テーマ関連スクリプトの共通処理（Chromeの解決 / MarpでのPNG化 / テーマ一覧・CSS解析）
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const THEMES_DIR = join(ROOT, 'themes');

/** エラーを1行で出して終了する（スタックトレースを見せない） */
export function fail(msg) {
  console.error(msg);
  process.exit(1);
}

/** ローカルのChrome / Chromium を探す。見つからなければ null */
export const chromePath = () =>
  process.env.CHROME_PATH ||
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find((p) => existsSync(p)) ||
  null;

/** PNG化・スクショにはChromeが必須。無い環境では先に分かりやすく落とす */
export function requireChrome() {
  if (!chromePath()) fail('Chrome / Chromium が見つかりません。CHROME_PATH で明示してください。');
}

/** ディレクトリ内の .md をまとめてPNG化する（Chrome起動は1回で済む） */
export function renderDeckDir(dir) {
  execFileSync(
    'npx',
    // --allow-local-files: 見本デッキが同ディレクトリのプレースホルダ画像を参照できるようにする
    ['--no-install', '@marp-team/marp-cli', '--theme-set', 'themes', '--html', '--allow-local-files', '--images', 'png', dir],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
  );
}

/**
 * HTMLをChromeヘッドレスで撮る。ページの実寸を width/height で渡す。
 * iframe や loading="lazy" を含むページは、読み込み完了まで仮想時間を進めてから
 * 撮る必要があるため waitMs を指定する（仮想時間なので実際の待ちはもっと短い）
 */
export function screenshot(htmlPath, outPath, width, height, waitMs = 0) {
  const chrome = chromePath();
  if (!chrome) throw new Error('Chrome / Chromium が見つかりません。CHROME_PATH で明示してください。');
  execFileSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      ...(waitMs > 0 ? [`--virtual-time-budget=${waitMs}`] : []),
      `--screenshot=${outPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
}

/** 作業ディレクトリを空の状態で用意する */
export function prepareWorkDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

/** ディレクトリ内のPNGをファイル名順で返す */
export function pngsIn(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
}

/**
 * テーマCSSを解析して { vars, imports, desc } を返す。
 * desc は `@theme` 行の次に来る最初の1行コメント（ギャラリー等の説明文に使う）
 */
export function parseThemeCss(file) {
  const css = readFileSync(join(THEMES_DIR, file), 'utf8');
  const vars = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) vars[m[1]] = m[2].trim();
  const imports = [...css.matchAll(/^@import\s+"([^"]+)"/gm)].map((m) => m[1]);
  const desc =
    [...css.matchAll(/^\/\*\s*(.*?)\s*\*\/$/gm)].map((m) => m[1]).find((c) => !c.startsWith('@theme')) || '';
  return { vars, imports, desc };
}

/** @import を再帰的に辿ってCSS変数を後勝ちでマージする */
export function resolveVars(name, seen = new Set()) {
  if (seen.has(name)) return {};
  seen.add(name);
  const { vars, imports } = parseThemeCss(`${name}.css`);
  let merged = {};
  // 'default' はMarp組み込みテーマ。themes/ にファイルはないので辿らない
  for (const imp of imports) if (imp !== 'default') merged = { ...merged, ...resolveVars(imp, seen) };
  return { ...merged, ...vars };
}

/**
 * themes/ のテーマ一覧。`theme:` に書ける名前だけを返す。
 * kind: color（配色のみ）/ combo（カラー+レイアウトの組み合わせ）
 * layout: combo が使う layout-* レイヤー名（color は null）
 */
export function listThemes() {
  return readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith('.css') && !f.startsWith('layout-'))
    .sort() // readdirSync の列挙順はOS/FS依存なので、一覧・ギャラリー・プレビューの順序を辞書順に固定する
    .map((f) => {
      const name = f.replace(/\.css$/, '');
      const { imports, desc } = parseThemeCss(f);
      const layout = imports.find((i) => i.startsWith('layout-')) ?? null;
      return { name, desc, kind: layout ? 'combo' : 'color', imports, layout };
    });
}

/**
 * CLI引数のテーマ名を検証して対象テーマ配列を返す。
 * 空なら全テーマ（base を除く）、不明な名前があれば候補を出して終了する
 */
export function pickThemes(wanted) {
  const all = listThemes().filter((t) => t.name !== 'base');
  const unknown = wanted.filter((w) => !all.some((t) => t.name === w));
  if (unknown.length) {
    console.error(`不明なテーマ: ${unknown.join(', ')}`);
    fail(`利用できるテーマ: ${all.map((t) => t.name).join(' / ')}`);
  }
  return wanted.length ? all.filter((t) => wanted.includes(t.name)) : all;
}
