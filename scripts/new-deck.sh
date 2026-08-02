#!/usr/bin/env bash
# 新しいスライドデッキを template/ から作成する
# 使い方: npm run new -- <deck-name>
#   例:   npm run new -- 20260801-my-talk
set -euo pipefail

cd "$(dirname "$0")/.."

name="${1:?Usage: npm run new -- <deck-name>  (例: 20260801-my-talk)}"
dir="slides/$name"

if [ -e "$dir" ]; then
  echo "Error: $dir は既に存在します" >&2
  exit 1
fi

mkdir -p "$dir/assets"
cp template/slides.md "$dir/slides.md"
touch "$dir/assets/.gitkeep"

echo "Created: $dir/slides.md"
node scripts/list-themes.mjs
