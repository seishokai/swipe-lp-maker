# Swipe LP Maker

Next.js + Supabase + Vercel で作る、スマホ特化の縦スワイプ LP メーカーです。

## 実装済み

- Supabase Auth ログイン
- LP 一覧
- LP 新規作成
- LP 編集
- 画像アップロード
- 画像の並び替え
- 画像削除
- 共通 CTA URL 設定
- 画像内 CTA 透明クリックエリア設定
- 画像上ドラッグによる CTA エリア作成
- CTA エリア削除
- 公開 URL `/lp/[slug]`
- 編集画面内スマホプレビュー
- 公開 / 非公開切替
- LP 複製
- Meta Pixel / Google Analytics ID 入力
- Supabase DB migration
- Supabase Storage policy
- Vercel 向け Next.js 構成

## セットアップ

1. Supabase で新規プロジェクトを作成する
2. `.env.example` を `.env.local` にコピーする
3. Supabase の値を入れる

```txt
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Supabase SQL Editor で以下を実行する

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/storage-policies.sql`

5. 開発サーバーを起動する

```bash
npm run dev
```

## 主要URL

- 管理画面: `/dashboard/lps`
- ログイン: `/login`
- 公開LP: `/lp/[slug]`
- パスワード再設定: `/reset-password`

## 管理画面でできること

- LP を作る
- 画像をアップロードする
- 画像をドラッグで並び替える
- 画像を削除する
- 画像上をドラッグして CTA クリック範囲を作る
- CTA エリアを削除する
- 公開 URL をコピーする
- スマホ幅プレビューを見る
- 公開 / 非公開を切り替える
- LP を複製する

## Supabase設定メモ

日本語の手順は `SUPABASE_SETUP_JA.md` にまとめています。

## Vercelデプロイ

デプロイ手順は `VERCEL_DEPLOY_JA.md` にまとめています。

## 確認コマンド

```bash
npm run typecheck
npm run build
```

どちらも確認済みです。
