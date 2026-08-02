#!/usr/bin/env bash
# デッキをビルドする（出力はデッキのディレクトリ内）
# 使い方: npm run build -- slides/<deck-name> [html|pdf|pptx|png]
#   png はスライド1枚ごとの画像を <deck>/png/ に出力（レイアウト検証用）
set -euo pipefail

cd "$(dirname "$0")/.."

deck="${1:?Usage: npm run build -- slides/<deck-name> [html|pdf|pptx|png]}"
fmt="${2:-html}"
deck="${deck%/}"
md="$deck/slides.md"

if [ ! -f "$md" ]; then
  echo "Error: $md が見つかりません" >&2
  exit 1
fi

marp_bin=(npx --no-install @marp-team/marp-cli)

case "$fmt" in
  html)
    "${marp_bin[@]}" --theme-set themes --html "$md" -o "$deck/slides.html"
    ;;
  pdf|pptx)
    "${marp_bin[@]}" --theme-set themes --html --allow-local-files "$md" --"$fmt" -o "$deck/slides.$fmt"
    ;;
  png)
    mkdir -p "$deck/png"
    "${marp_bin[@]}" --theme-set themes --html --allow-local-files "$md" --images png -o "$deck/png/slide.png"
    echo "PNG files: $deck/png/"
    ;;
  *)
    echo "Error: 未対応の形式 '$fmt'（html|pdf|pptx|png）" >&2
    exit 1
    ;;
esac
