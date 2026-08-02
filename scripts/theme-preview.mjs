#!/usr/bin/env node
// デッキのテーマをセレクタで動的に切り替えながらプレビューするHTMLを作る
//   npm run theme-preview -- slides/<deck>                  # 全テーマ（生成後にブラウザで開く）
//   npm run theme-preview -- slides/<deck> sunrise coral    # テーマを絞る
//   npm run theme-preview -- slides/<deck> --no-open        # 開かずにパスだけ出す
//
// 仕組み: デッキの slides.md を theme だけ差し替えてテーマごとにHTML化し、
// <select> + iframe で切り替えるラッパーページを <deck>/.theme-preview/ に生成する。
// Chrome不要（HTML変換のみ）。切り替え時はできるだけ表示中のページ位置を引き継ぐ。
import { execFileSync, execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { ROOT, fail, listThemes, pickThemes, prepareWorkDir } from './lib/render.mjs';

const args = process.argv.slice(2);
const noOpen = args.includes('--no-open');
const rest = args.filter((a) => !a.startsWith('--'));
const deckArg = rest[0];
if (!deckArg) fail('使い方: npm run theme-preview -- slides/<deck-name> [テーマ名...] [--no-open]');

const deckDir = resolve(ROOT, deckArg.replace(/\/$/, ''));
// .theme-preview を作り直す（rmSync する）ので、対象が slides/ 配下であることを先に保証する
const relFromSlides = relative(join(ROOT, 'slides'), deckDir);
if (!relFromSlides || relFromSlides.startsWith('..') || isAbsolute(relFromSlides))
  fail(`デッキは slides/ 配下で指定してください: ${deckArg}`);
const md = join(deckDir, 'slides.md');
if (!existsSync(md)) fail(`${deckArg}/slides.md が見つかりません`);

const themes = pickThemes(rest.slice(1));
const source = readFileSync(md, 'utf8');
const current = source.match(/^theme:\s*(\S+)/m)?.[1] ?? null;
if (!current) fail('slides.md のフロントマターに theme: がありません');
// pickThemes は base を除外するが、デッキの現テーマが base ならそれも初期表示できるよう含める
if (!rest.slice(1).length && !themes.some((t) => t.name === current)) {
  const extra = listThemes().find((t) => t.name === current);
  if (extra) themes.unshift(extra);
}

// ---------------------------------------------------------------- 生成

const WORK = join(deckDir, '.theme-preview');
prepareWorkDir(WORK);
// デッキが assets/ の画像を相対参照していても同じパスで解決できるようコピーする
if (existsSync(join(deckDir, 'assets'))) cpSync(join(deckDir, 'assets'), join(WORK, 'assets'), { recursive: true });

for (const t of themes) writeFileSync(join(WORK, `${t.name}.md`), source.replace(/^theme:\s*\S+$/m, `theme: ${t.name}`));

console.log(`${themes.length}テーマ分のHTMLを書き出しています…`);
execFileSync('npx', ['--no-install', '@marp-team/marp-cli', '--theme-set', 'themes', '--html', WORK], {
  cwd: ROOT,
  stdio: ['ignore', 'ignore', 'inherit'],
});
for (const t of themes) rmSync(join(WORK, `${t.name}.md`), { force: true });

// テーマ名・説明は themes/*.css のコメント由来なのでHTMLに埋め込む前にエスケープする
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 初期表示テーマ。セレクタの selected と iframe の初期 src がずれないよう1箇所で決める
const initial = themes.some((t) => t.name === current) ? current : themes[0].name;

const group = (kind, label) => {
  const opts = themes
    .filter((t) => t.kind === kind)
    .map((t) => `<option value="${esc(t.name)}" data-desc="${esc(t.desc)}"${t.name === initial ? ' selected' : ''}>${esc(t.name)}</option>`)
    .join('');
  return opts ? `<optgroup label="${label}">${opts}</optgroup>` : '';
};

const html = `<!doctype html><html lang="ja"><meta charset="utf-8">
<title>テーマプレビュー: ${esc(deckArg)}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; height: 100vh; display: flex; flex-direction: column; background: Canvas; color: CanvasText;
         font-family: system-ui, -apple-system, 'Hiragino Sans', sans-serif; }
  header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 10px 16px;
           border-bottom: 1px solid color-mix(in srgb, CanvasText 15%, transparent); font-size: 13px; }
  h1 { font-size: 14px; margin: 0 8px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  select, button { padding: 5px 10px; font-size: 13px; cursor: pointer; background: Canvas; color: CanvasText;
    border: 1px solid color-mix(in srgb, CanvasText 30%, transparent); border-radius: 6px; }
  select { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .desc { opacity: 0.65; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
  iframe { flex: 1; border: 0; width: 100%; }
</style>
<header>
  <h1>${esc(deckArg)}</h1>
  <button id="prev" title="前のテーマ" aria-label="前のテーマ">◀</button>
  <select id="theme" aria-label="テーマ">${group('color', '配色')}${group('combo', '組み合わせ')}</select>
  <button id="next" title="次のテーマ" aria-label="次のテーマ">▶</button>
  <span class="desc" id="desc"></span>
</header>
<iframe id="view" src="${esc(initial)}.html"></iframe>
<script>
  const sel = document.getElementById('theme');
  const view = document.getElementById('view');
  const desc = document.getElementById('desc');
  const show = () => {
    // 表示中のページ位置（URLハッシュ）をできるだけ引き継ぐ。
    // file:// 直開きの Chrome では iframe への同一オリジンアクセスが拒否されるので、その場合は先頭から
    let hash = '';
    try { hash = view.contentWindow.location.hash; } catch {}
    view.src = encodeURIComponent(sel.value) + '.html' + hash;
    desc.textContent = sel.selectedOptions[0]?.dataset.desc || '';
  };
  const step = (d) => {
    sel.selectedIndex = (sel.selectedIndex + d + sel.options.length) % sel.options.length;
    show();
  };
  sel.addEventListener('change', show);
  document.getElementById('prev').addEventListener('click', () => step(-1));
  document.getElementById('next').addEventListener('click', () => step(1));
  addEventListener('keydown', (e) => {
    if (e.key === '[') step(-1);
    if (e.key === ']') step(1);
  });
  desc.textContent = sel.selectedOptions[0]?.dataset.desc || '';
</script>
</html>`;

const out = join(WORK, 'index.html');
writeFileSync(out, html);
console.log(`\n${out}`);
console.log('（テーマ切替は [ / ] キーでも可。スライド操作は矢印キー）');

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
