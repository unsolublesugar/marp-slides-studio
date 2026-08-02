#!/usr/bin/env node
// 利用できるテーマの一覧を表示する（themes/ から動的に列挙）
//   node scripts/list-themes.mjs
// new-deck.sh からも呼ばれる。テーマを追加してもここを直す必要はない。
import { listThemes } from './lib/render.mjs';

const themes = listThemes().filter((t) => t.name !== 'base');
const width = Math.max(...themes.map((t) => t.name.length));
const section = (label, items) => {
  console.log(`  ${label}:`);
  for (const t of items) console.log(`    ${t.name.padEnd(width)}  ${t.desc}`);
};

console.log('テーマは front-matter の theme: で選択（base は navy のエイリアス）');
section('配色', themes.filter((t) => t.kind === 'color'));
section('組み合わせ（配色 + レイアウト）', themes.filter((t) => t.kind === 'combo'));
console.log('実物を見比べるには: npm run gallery');
