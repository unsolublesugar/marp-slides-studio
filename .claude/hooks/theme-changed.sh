#!/usr/bin/env bash
# PostToolUse hook: themes/*.css の変更を検知して marp-theme スキルの手順へ誘導する
# 登録先チェックリストの実体は .claude/skills/marp-theme/SKILL.md の「登録先」節（ここには書かない）
set -u

# jq が無い場合の通知にも使うので、jq に頼らず bash だけでJSON文字列エスケープする
context() {
  local msg=$1
  msg=${msg//\\/\\\\}
  msg=${msg//\"/\\\"}
  msg=${msg//$'\n'/\\n}
  msg=${msg//$'\t'/\\t}
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"%s"}}' "$msg"
}

if ! command -v jq >/dev/null 2>&1; then
  context "jq が見つからないため、テーマ変更の波及先チェックをスキップした（brew install jq で有効になる）"
  exit 0
fi

path=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
printf '%s' "$path" | grep -q '/themes/[^/]*\.css$' || exit 0

context "themes/ のCSSを変更した。marp-theme スキルに従うこと。変更後は npm run theme-check（コントラスト検査 + settings.json 登録漏れ検出）と npm run gallery（実物確認）を通す。テーマの追加・削除・改名・用途変更にあたる場合は、marp-theme スキルの「登録先」節にあるチェックリストの各所も更新すること（既存テーマの数値調整だけなら更新不要）。"
