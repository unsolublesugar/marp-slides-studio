---
name: marp-check
description: Marpスライドの視覚検証ワークフロー。スライドをPNG画像に書き出して1枚ずつ目視チェックする。「スライドを確認して」「レイアウト崩れがないか見て」「検証して」、またはmarp-deckスキルでスライドを作成・編集した後の最終確認で必ず使う。
---

# スライド視覚検証ワークフロー

スライドのMarkdown/CSSを編集しただけでは崩れに気づけない。必ず画像に書き出して1枚ずつ確認する。

## 手順

1. **PNG書き出し**: `npm run build -- slides/<deck> png`
   - `slides/<deck>/png/slide.001.png` 形式で全スライドが出力される
2. **全スライドをReadツールで開いて目視確認**する。チェック項目:
   - [ ] テキストがカードやスライド端からあふれていない（オーバーフロー）
   - [ ] 画像が枠内に収まり、極端に小さく/大きくなっていない
   - [ ] 見出しの改行位置が不自然でない
   - [ ] アクセント色が1スライド1〜2箇所に収まっている
   - [ ] 空白が偏っていない（下半分がスカスカ等）
   - [ ] 誤字・全角半角の混在がない
3. **問題があれば修正**して 1. に戻る。テキスト量を減らす・スライドを分割するのが第一選択。CSSいじりは最終手段
4. **全スライドがパスしたら成果物をビルド**: `npm run build -- slides/<deck>` および `npm run build -- slides/<deck> pdf`
5. 検証用の `png/` ディレクトリは .gitignore 済みなので残してよい

## 注意

- PNG/PDF出力にはChrome/Chromiumが必要（marp-cliがローカルのブラウザを使う）
- 確認結果は「スライドN: 問題なし / 問題あり(内容)」の形で報告する

## HTML/PNGとPDFの描画差

PDFだけはChromeの**印刷経路**で描画されるため、HTML・PNG（画面メディア）と結果が一致しないことがある。制約の詳細は [.steering/marp-constraints.md](../../../.steering/marp-constraints.md) を参照。**新しく影・フィルタ・半透明の装飾をテーマに足したら、PDFでも必ず確認する。**

PDF単体の見え方は次の方法で確認できる（sipsは1ページ目のみ変換）。

```bash
npm run build -- slides/<deck> pdf
sips -s format png slides/<deck>/slides.pdf --out /tmp/page1.png
```

特定ページを見たいときは、そのスライドだけの一時デッキを `slides/` 配下に作ってPDF化するのが早い（`slides/` の外だとビルドが通らないことがある）。
