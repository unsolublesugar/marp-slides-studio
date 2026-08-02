---
name: marp-deck
description: Marpスライドデッキの新規作成・編集ワークフロー。「スライドを作って」「LT資料を作りたい」「発表資料」「デッキを追加」などスライド作成の依頼があれば必ずこのスキルを使う。レイアウトパターンの選び方・スタイルルール・ビルド方法を含む。
---

# Marpスライドデッキ作成ワークフロー

このリポジトリはMarpスライドのテンプレートプロジェクト。スライドは1デッキ=1ディレクトリで `slides/<YYYYMMDD>-<slug>/` に置く。

## 手順

1. **デッキ作成**: `npm run new -- <YYYYMMDD>-<slug>`（template/slides.md がコピーされる）
2. **テーマ選択**: front-matter の `theme:` を「発表する場の空気」→「題材の色」の順に選ぶ。迷ったら `base`
   - スタンダード（直線的な角ゴシック。技術・ビジネス全般）
     - `base`(=`navy`): ネイビー×ティール。デフォルト
     - `wine`: ワインレッド×コーラル。エモーショナル・クリエイティブ系
     - `forest`: グリーン×リーフ。落ち着き・サステナブル系
     - `charcoal`: チャコール×アンバー。モノトーン・シャープ系
     - `sunrise`: オレンジ×アンバー。明るく前向きな暖色。LT・社内共有
     - `coral`: コーラル×ピーチ。やわらかい暖色。ふりかえり・コミュニティ
   - カジュアル（丸ゴシック・大きめ角丸。社内LT・勉強会・もくもく会）
     - `casual-mint`: ミント×コーラル / `casual-berry`: ラズベリー×ミント / `casual-sky`: スカイブルー×レモン
   - ポップ（極太丸ゴシック・ハードシャドウ。イベント・アイスブレイク・ハンズオン）
     - `pop-neon`: ホットピンク×ライム / `pop-soda`: ソーダブルー×オレンジ
   - シック（明朝・角丸ゼロ・字間広め。対談・基調講演・振り返り）
     - `chic-ink`: 墨×シャンパンゴールド / `chic-plum`: プラム×ローズゴールド
   - ビジネス（角ゴシック・角丸小さめ・ヘアライン。提案・報告・社外プレゼン）
     - `business-azure`: コーポレートブルー×オレンジ / `business-slate`: スレート×ティール
   - パステル（淡色の面・表紙も淡色。明るく軽やかに見せたいとき）
     - `pastel-sky`: ペールブルー×コーラル / `pastel-cream`: クリーム×テラコッタ / `pastel-sage`: セージ×プラム
   - オーロラ（暗い全面キャンバス＋流れる光のリボン。テック系イベント・LT・デモ）
     - `aurora-cloud`: 濃紺×シアン×グリーン / `aurora-night`: 漆黒×シアン×レッド
     - 配色のみの `aurora-blue` / `aurora-neon` は単体でも使える（明るいキャンバスのまま同系配色）
   - ウェーブ（白地＋角から流れ込む色面。明るい場・カジュアルな場向け）
     - `wave-<カラー>`: スタンダード6配色すべて（例: `wave-sunrise` / `wave-navy`）
   - レイアウト違い（組み方そのものを変える。Markdownは同じでよい。`<カラー>` = スタンダード6配色）
     - `band-<カラー>` / `band-pop-soda`: 見出しを全幅の帯に。情報量が多いとき
     - `split-<カラー>` / `split-chic-ink`: 縦2分割。表紙タイトルは20文字程度まで
     - `minimal-<カラー>` / `minimal-slate` / `minimal-ink`: 罫線と余白だけ。読ませる資料向け
3. **構成を決める**: title → アジェンダ → (section → content×N)×章数 → まとめ → reference → closing
4. **各スライドを書く**: [patterns.md](patterns.md) のレイアウトパターンから選んで組む。ゼロからHTMLを設計しない
5. **スタイルルールを守る**: [style-rules.md](style-rules.md) に従う
6. **ビルド**: `npm run build -- slides/<deck>` (html) / `npm run build -- slides/<deck> pdf`
7. **視覚検証**: marp-check スキルでスライド画像を確認してから完成とする

## テーマ自体を触るとき

テーマの追加・変更は marp-theme スキルに従う（コントラスト検査 `npm run theme-check` → ギャラリー `npm run gallery` での実物確認 → 5箇所の登録更新）。

どのテーマにするか迷ったら `npm run gallery` で全テーマを並べて見比べられる。

## 重要な約束

- テーマCSS（themes/）はデッキ側の都合で書き換えない。デッキ固有の微調整はインラインstyleで最小限に
- 画像はデッキ内の `assets/` に置き、`assets/xxx.png` で相対参照する
- 生成物（slides.html / slides.pdf）はデッキのディレクトリ内に出力される
- template/slides.md 自体が全レイアウトのカタログ。迷ったら実物を見る
