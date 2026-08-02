---
description: Git・PR の運用規範（ブランチ→PR→Copilotレビュー→ユーザーがマージ）
---

# Git 運用規範

外部コントリビュータ向けの案内は [CONTRIBUTING.md](../../CONTRIBUTING.md)。ここはこのリポジトリで作業するエージェント向けの規範で、「Copilot アサイン」「マージはユーザー」はメンテナ環境での運用手順。

## ブランチとPR

- main へ直接コミットしない。`feat/` `fix/` `add/` `docs/` などの接頭辞付きブランチを切って PR を作る
- スライドデッキの追加は `add/<YYYYMMDD>-<slug>` ブランチ
- PR 作成後、**Copilot をレビュアーにアサイン**する（メンテナ環境のみ。権限がなければスキップ）:
  `gh api repos/<owner>/<repo>/pulls/<番号>/requested_reviewers -f 'reviewers[]=copilot-pull-request-reviewer[bot]'`
- Copilot の指摘には対応 or 見送りの判断を添えて**返信コメントまで行う**。対応した場合は再レビューを依頼する
- **マージはユーザーが行う**。ユーザーから「マージした」と聞いたら main を取り込み、マージ済みブランチを削除する

## PR前のチェック

- `themes/` や `scripts/` を触った場合は `npm run theme-check` を通す（exit 0）
- テーマの見た目に関わる変更は `npm run gallery` の実物確認を済ませてから PR にする
- README掲載画像に影響する変更は `npm run docs-shot` で撮り直し、差分をコミットに含める

## コミット・生成物

- コミットメッセージは日本語で「何を・なぜ」が分かるように。1行目は変更の要約
- 生成物（slides.html / slides.pdf）は各デッキのディレクトリ内に置く。検証用PNG（`<deck>/png/` / `.gallery/` / `.docs-shot/`）はコミットしない（.gitignore 済み）
- `docs/*.png` の再生成は原則 `npm run docs-shot` で行う（marp-shots スキル）。ただし**ユーザーが手動で作成・加工した画像への差し替えは可**。手動画像が置かれている場合、エージェントは依頼なしに `docs-shot` で上書きしない
