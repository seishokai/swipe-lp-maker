# 技術メモ

## セットアップ

```powershell
npm install
npm run dev
npm run typecheck
npm run build
```

ローカルURL:

```text
http://localhost:3000
```

## 環境変数

ローカル `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ndlfqrvoejwgqfdtghmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JPzgVHsAUdW-qSGy2_G5fw_kEPCMF3w
```

Vercel本番:

```env
NEXT_PUBLIC_SITE_URL=https://swipe-lp-maker.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://ndlfqrvoejwgqfdtghmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JPzgVHsAUdW-qSGy2_G5fw_kEPCMF3w
```

注意:
`NEXT_PUBLIC_SUPABASE_ANON_KEY` はSupabaseのPublishable keyです。service role key は絶対にフロントやGitに入れないでください。

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
  supabase/
  lps.ts
  lp-images.ts
  cta-areas.ts
  trainings.ts
  training-sections.ts
  training-assets.ts

types/
  lp.ts
  training.ts

supabase/
  migrations/
  storage-policies.sql
```

## DB設計

LP系:

- `profiles`
- `landing_pages`
- `lp_images`
- `cta_areas`

研修系:

- `training_courses`
- `training_sections`
- `training_assets`

Migration:

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0002_media_and_fixed_cta.sql`
- `supabase/migrations/0003_training_courses.sql`

## Storage設計

Bucket:

- `lp-images`
- `training-assets`

想定パス:

```text
lp-images/{user_id}/{lp_id}/{file_id}.{ext}
training-assets/{user_id}/{training_id}/{file_id}.{ext}
```

Storage policy:

- 所有者は自分のフォルダにupload/update/delete可能
- 公開LP/公開研修で表示するためselectはpublic許可

## 重要ファイル

- 公開LP: `app/lp/[slug]/page.tsx`
- 公開LPビュー: `components/lp/swipe-lp-viewer.tsx`
- LP編集画面: `components/dashboard/edit-lp-tabs.tsx`
- アップロード: `components/dashboard/image-uploader.tsx`
- 並び替え: `components/dashboard/sortable-image-list.tsx`
- CTAエリア: `components/dashboard/cta-area-editor.tsx`
- LP API: `app/api/lps/*`
- 画像API: `app/api/lp-images/*`
- CTA API: `app/api/cta-areas/*`

## 文字化けチェック

変更後に以下を実行してください。

```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css -File app,components,lib,types |
  Select-String -Pattern '繧|縺|蜈|逕|譁|險|菫|荳|鬮|蟷|髢|螳|邱|蜍|驥|謫|譫|蝓|髱|螟|遐|雉|侭|諷|邂'
```

何か出たら文字化けの可能性が高いです。

## デプロイ

GitHub main にpushするとVercelが自動デプロイします。

```powershell
git status
git add .
git commit -m "message"
git push origin main
```

デプロイ後は以下を確認:

- https://swipe-lp-maker.vercel.app/login
- https://swipe-lp-maker.vercel.app/dashboard/lps
- https://swipe-lp-maker.vercel.app/lp/test-lp

