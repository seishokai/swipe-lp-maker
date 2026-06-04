# プロジェクト現状

## 概要

Swipe LP Maker は、画像や動画をアップロードして Instagram ストーリーのような縦スワイプLPを作成・公開できる管理システムです。

主な用途:
- 広告会社向けのLP制作ツール
- 歯科医院、美容クリニック、医療系LP
- 画像素材を並べるだけでスマホLPを公開する
- 将来的には月額課金SaaS化

## 本番情報

- 本番URL: https://swipe-lp-maker.vercel.app
- LP一覧: https://swipe-lp-maker.vercel.app/dashboard/lps
- テストLP: https://swipe-lp-maker.vercel.app/lp/test-lp
- GitHub: https://github.com/seishokai/swipe-lp-maker
- Supabase Project URL: https://ndlfqrvoejwgqfdtghmg.supabase.co

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Vercel

## 実装済み機能

### LP管理

- LP一覧
- LP新規作成
- LP編集
- 公開/非公開切替
- LP複製
- CTA URL設定
- 固定CTA設定
- Meta Pixel / Google Analytics / custom head tags
- 公開URL `/lp/[slug]`

### 画像/動画管理

- 画像アップロード
- 動画アップロード
- 複数ファイルの一括アップロード
- アップロード上限表示
  - 最大20件
  - 画像10MBまで
  - 動画120MBまで
- 画像/動画削除
- 並び替え
- 画像内CTAクリックエリア設定

### 公開LP

- スマホファースト
- 縦スワイプ
- scroll-snap
- 画像内CTAだけ透明リンク
- PCでは表示切替
  - スマホ枠
  - 画面いっぱい
  - 全画面
- 初期表示は「画面いっぱい」
- 縦長LP画像は切らずにフル幅表示
- 既存アップロード済み画像にも表示修正が効く

### 研修資料管理

- `/dashboard/trainings`
- `/dashboard/trainings/new`
- `/dashboard/trainings/[id]/edit`
- `/training/[slug]`
- セクション追加/編集/削除
- 画像/動画/PDFアップロード
- 公開/非公開
- 複製

注意:
研修資料管理は `supabase/migrations/0003_training_courses.sql` のDB反映が必要です。未反映だと `/dashboard/trainings` が500エラーになる可能性があります。

## 直近の重要修正

公開LPの表示で、スマホ実機閲覧時に画像の左右が黒く見える問題がありました。

対応内容:
- `components/lp/swipe-lp-viewer.tsx`
- 初期表示を `phone` から `fill` に変更
- PCの切替ラベルを正常な日本語へ修正
- 縦長画像判定を `height / width >= 1.9` に調整
- 縦長LP画像は `lp-slide-image-long` でフル幅/縦スクロール表示

検証済み:
- `npm run typecheck`
- `npm run build`
- 本番 `/lp/test-lp` がHTTP 200
- 本番DOMで `lp-scroll-fill` と `画面いっぱい` 初期表示を確認

## 既知の注意点

- 既存の `CLAUDE_CODE_HANDOFF_PROMPT_JA.md` と `CLAUDE_CODE_PROJECT_HANDOFF_JA.md` は文字化けしているため、この `handoff/claude-code` フォルダの新版を使うこと。
- 研修資料管理はDB反映状況に注意。
- Supabaseメール認証はレート制限にかかることがある。パスワードログインを優先。
- SaaS化に必要な課金/組織/権限管理は未実装。

