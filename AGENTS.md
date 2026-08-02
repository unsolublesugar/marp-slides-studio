# AGENTS.md

AIエージェント向けの共通エントリポイント。プロジェクトの構成・コマンド・ルール参照は [CLAUDE.md](CLAUDE.md) に集約してあるので、**まず CLAUDE.md を読むこと**。このファイルには Claude Code 以外のエージェントが補う必要がある差分だけを書く。

## Claude Code 以外のエージェントへの補足

Claude Code では自動で効く仕組みが、他のエージェントでは効かない。同等の品質を保つため、以下を手動で守ること。

### スキル（ワークフロー手順書）を明示的に読む

`.claude/skills/` の各 `SKILL.md` は Claude Code では依頼内容に応じて自動発動するが、他エージェントでは自動発動しない。該当作業の**前に必ず読んで手順に従う**こと。

| 作業 | 読むファイル |
| --- | --- |
| スライドの作成・編集 | `.claude/skills/marp-deck/SKILL.md`（レイアウトパターンは同ディレクトリの patterns.md） |
| 完成前の視覚検証 | `.claude/skills/marp-check/SKILL.md` |
| テーマの追加・変更・確認 | `.claude/skills/marp-theme/SKILL.md` |
| README用スクショの更新 | `.claude/skills/marp-shots/SKILL.md` |

### hook の代わりに自分でチェックを回す

Claude Code では `themes/*.css` を編集すると hook（`.claude/hooks/theme-changed.sh`）が検証手順を注入するが、他エージェントでは何も起きない。`themes/` を1ファイルでも触ったら、自発的に以下を実行すること。

1. `npm run theme-check` を通す（exit 0 になるまで）
2. `npm run gallery -- <テーマ名>` で実物を確認する
3. marp-theme スキルの「登録先」チェックリストに従って各所を更新する

### エージェント非依存の安全網

以下はスクリプト側で強制されるので、どのエージェントでも同じように機能する。落ちたら直してから先に進むこと。

- `npm run theme-check` — コントラスト検査 + `.vscode/settings.json` 登録漏れ + README の件数表記照合。違反で exit 1
- 生成コマンドの出力を `head` で切らない等の運用上の罠は `.steering/troubleshooting.md` に記録済み
