# Claude Code向けプロジェクト引継ぎ資料

## 概要

このプロジェクトは、スマホ特化のスワイプ型LPメーカーと、研修資料管理機能を持つNext.jsアプリです。

- 本番URL: https://swipe-lp-maker.vercel.app
- GitHub: https://github.com/seishokai/swipe-lp-maker
- Supabase Project URL: https://ndlfqrvoejwgqfdtghmg.supabase.co
- ログインID: `tkm.koike@gmail.com`
- パスワード: `Edoyadepon1`

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Vercel

## 主要コマンド

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## 環境変数

ローカル `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ndlfqrvoejwgqfdtghmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JPzgVHsAUdW-qSGy2_G5fw_kEPCMF3w
```

Vercel本番では `NEXT_PUBLIC_SITE_URL` を以下にする想定です。

```env
NEXT_PUBLIC_SITE_URL=https://swipe-lp-maker.vercel.app
```

## 主要ディレクトリ

```text
app/
  (auth)/
    login/
    reset-password/
    callback/
  (dashboard)/
    dashboard/
      lps/
      trainings/
  api/
    lps/
    lp-images/
    cta-areas/
    training-assets/
  lp/[slug]/
  training/[slug]/

components/
  auth/
  dashboard/
  lp/
  ui/

lib/
  auth.ts
  lps.ts
  lp-images.ts
  cta-areas.ts
  trainings.ts
  training-sections.ts
  training-assets.ts
  supabase/

supabase/
  migrations/
  storage-policies.sql

types/
  lp.ts
  training.ts
```

## 実装済み機能

### Swipe LP Maker

管理画面:

- `/dashboard/lps`
- `/dashboard/lps/new`
- `/dashboard/lps/[id]/edit`

公開ページ:

- `/lp/[slug]`

機能:

- LP一覧
- LP新規作成
- LP編集
- 画像/動画まとめてアップロード
- アップロード上限表示
  - 一度に最大20件
  - 画像20MBまで
  - 動画120MBまで
- 並び替え
- 削除
- 画像内CTAクリックエリア
- CTA URL設定
- 固定CTA
- 公開/非公開
- 複製
- Meta Pixel / Google Analytics
- 公開URL発行
- PC表示切替
  - スマホ比率
  - 画面いっぱい
  - 全画面

重要な実装:

- 画像/動画アップロードは、Vercelのアップロード容量制限を避けるため、ブラウザからSupabase Storageへ直接アップロードする方式。
- その後 `/api/lp-images` にJSONでDB登録する。

### 研修資料管理

管理画面:

- `/dashboard/trainings`
- `/dashboard/trainings/new`
- `/dashboard/trainings/[id]/edit`

公開ページ:

- `/training/[slug]`

機能:

- 研修資料一覧
- 研修資料新規作成
- 研修資料編集
- セクション追加/編集/削除
- 画像/動画/PDFアップロード
- 資料ファイル削除
- セクション並び替え
- 公開/非公開
- 複製
- 公開URL発行

重要:

- 研修資料管理は、Supabaseに追加DBが必要です。
- SQL: `supabase/migrations/0003_training_courses.sql`
- このSQLをSupabase SQL Editorで実行しないと、研修一覧はDB未設定案内を表示します。

## Supabase DB

### LP系

主なテーブル:

- `profiles`
- `landing_pages`
- `lp_images`
- `cta_areas`

SQL:

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0002_media_and_fixed_cta.sql`

Storage:

- bucket: `lp-images`

### 研修系

主なテーブル:

- `training_courses`
- `training_sections`
- `training_assets`

SQL:

- `supabase/migrations/0003_training_courses.sql`

Storage:

- bucket: `training-assets`

## 既知の注意点

1. 研修用DBが未適用の場合
   - `/dashboard/trainings` は500ではなく日本語案内を出す設計。
   - 新規作成などはDB未適用だと当然失敗するため、SQL適用が必要。

2. 文字化け
   - 過去に日本語文字化けが発生した。
   - 修正前に以下のような文字列が残っていないか検索すること。

```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css -File app,components,lib,types |
  Select-String -Pattern '繧|縺|蜈|逕|譁|險|菫|荳|鬮|蟷|髢|螳|邱|蜍|驥|謫|譫|蝓|髱|螟|遐|雉|侭|諷|邂'
```

3. Vercel反映
   - `main` にpushするとVercelが自動デプロイ。
   - 反映直後はブラウザをハードリロードする。

4. Supabase Storage
   - `lp-images` と `training-assets` はpublic bucket想定。
   - RLS/Storage policyはSQLに含めている。

5. 課金/組織機能
   - まだ未実装。
   - SaaSとして月額課金するには、組織、権限、Stripe等が必要。

## 次のおすすめ作業

1. Supabase SQL Editorで `0003_training_courses.sql` を実行
2. 研修資料を1件作成して公開確認
3. スマホ実機で `/lp/test-lp` と `/training/[slug]` を確認
4. 研修資料管理UIをさらに磨く
5. 受講完了チェック、閲覧履歴を追加
6. テンプレート機能を追加
7. 広告会社向けSaaS化のため、組織/ユーザー/請求管理を追加

