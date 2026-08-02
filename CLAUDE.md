# marp-slides-studio

Marpスライドの制作環境。スライドは1デッキ=1ディレクトリで管理する。Claude Code 以外のエージェント向けの入口は [AGENTS.md](AGENTS.md)。

## 構成

- `slides/<YYYYMMDD>-<slug>/` — 各スライドデッキ（slides.md + assets/ + 生成物）。**公開リポジトリ（unsolublesugar/marp-slides-studio）では見本デッキ以外の slides/ は .gitignore 済み**。ここに私物デッキを追加・コミットしない（スライド制作はテンプレートから作った自分のリポジトリで行う）
- `themes/` — 共通テーマCSS。`base`(=navy) がレイアウトとトークンの実体
  - スタンダード（カラーのみ上書き）: `navy` / `wine` / `forest` / `charcoal` / `sunrise` / `coral`
  - トーン付き（書体・角丸・影＋カラーを上書き）: `casual-*` / `pop-*` / `chic-*` / `business-*` / `pastel-*`
  - 暗いキャンバス用カラー（`--canvas-bg` / `--ribbon-*` を持つ）: `aurora-blue` / `aurora-neon`
  - レイアウトレイヤー（唯一セレクタを持つ）: `layout-band` / `layout-split` / `layout-minimal` / `layout-aurora` / `layout-wave`
  - 組み合わせ: `band-*` / `split-*` / `minimal-*` / `aurora-*` / `wave-*` = カラーテーマ + レイアウトレイヤーを @import するだけの2行。band / split / minimal / wave はスタンダード6配色すべてを持つ（aurora のみ専用配色2種）
- `template/slides.md` — 全レイアウトパターンのカタログ兼、新規デッキの雛形
- `scripts/` — build / new-deck / list-themes / theme-gallery / theme-preview / theme-check / docs-shot（共通処理は `scripts/lib/render.mjs`）
- `.claude/skills/` — 作業ワークフロー（下記「スキルの使い分け」）
- `.claude/rules/` — 運用規範。**該当領域を触る前に必ず読む**
- `.steering/` — 設計知識・制約。実装判断や調査の前に該当ファイルを読む

## コマンド

```bash
npm run new -- 20260801-my-talk        # 新規デッキ作成（テーマ一覧も表示）
npm run build -- slides/<deck>         # HTML出力
npm run build -- slides/<deck> pdf     # PDF出力（要Chrome）
npm run build -- slides/<deck> png     # 検証用スライド画像出力
npm run preview                        # ライブプレビューサーバ
npm run gallery                        # 全テーマ×全パターンのギャラリー（通常表示は代表4枚、展開可）
npm run gallery -- sunrise wave-coral  # テーマ指定
npm run theme-preview -- slides/<deck> # デッキをテーマ切替セレクタ付きでプレビュー
npm run theme-check                    # コントラスト検査 + settings.json 登録漏れ検出（違反で exit 1）
npm run docs-shot                      # README用スクショ（docs/*.png）を再生成
```

## スキルの使い分け

| 作業 | スキル |
| --- | --- |
| スライドの作成・編集 | marp-deck |
| 完成前の視覚検証 | marp-check |
| テーマの追加・変更・確認 | marp-theme |
| README用スクショの更新 | marp-shots |

## ルール（詳細は各ファイル）

- **[.claude/rules/theme-css.md](.claude/rules/theme-css.md)** — themes/ を触るとき: 変数上書きのみ・トークン設計・コントラスト下限・検証と登録
- **[.claude/rules/git-workflow.md](.claude/rules/git-workflow.md)** — ブランチ→PR→Copilotレビュー→ユーザーがマージ、PR前チェック、生成物の扱い
- **[.steering/marp-constraints.md](.steering/marp-constraints.md)** — Marp/Marpit の変えられない制約（疑似要素・PDF描画差・light-dark() など）。描画がおかしいときはまずここ
- **[.steering/architecture.md](.steering/architecture.md)** — テーマシステムとスクリプト基盤の設計意図
- **[.steering/troubleshooting.md](.steering/troubleshooting.md)** — 過去に踏んだ罠（生成コマンドの出力を head で切らない、PNG差分は再実行してから判断、など）
