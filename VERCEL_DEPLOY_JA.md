# Vercel デプロイ手順

ローカル実装と初回 Git commit は完了済みです。

## 現在の状態

- `npm run build` 成功
- Git 初期化済み
- 初回コミット済み
- `.env.local` は Git 除外済み
- Supabase DB / Storage 設定済み

## デプロイで必要な環境変数

Vercel の Project Settings -> Environment Variables に入れる。

```txt
NEXT_PUBLIC_SITE_URL=https://デプロイ後のVercelドメイン
NEXT_PUBLIC_SUPABASE_URL=https://ndlfqrvoejwgqfdtghmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JPzgVHsAUdW-qSGy2_G5fw_kEPCMF3w
```

最初のデプロイ前は `NEXT_PUBLIC_SITE_URL` が未確定なので、仮で以下でもよい。

```txt
NEXT_PUBLIC_SITE_URL=https://プロジェクト名.vercel.app
```

デプロイ後に実際のURLへ直す。

## Supabase に追加するURL

Vercel のURLが決まったら、Supabase Dashboard の `Authentication -> URL Configuration` に追加する。

### Site URL

```txt
https://デプロイ後のVercelドメイン
```

### Redirect URLs

```txt
https://デプロイ後のVercelドメイン/callback
https://デプロイ後のVercelドメイン/reset-password
```

ローカル開発も続ける場合は、以下も残しておく。

```txt
http://localhost:3000/callback
http://localhost:3000/reset-password
```

## GitHub 経由でデプロイする手順

1. GitHub で新規リポジトリを作る
   - 例: `swipe-lp-maker`
   - Public / Private はどちらでもOK
   - README は作らない

2. ローカルで remote を設定

```bash
git remote add origin https://github.com/YOUR_NAME/swipe-lp-maker.git
git branch -M main
git push -u origin main
```

3. Vercel を開く

```txt
https://vercel.com/new
```

4. GitHub リポジトリを Import

5. Framework Preset は Next.js

6. Environment Variables を入れる

7. Deploy

## 注意

- `Secret key` は Vercel に入れない
- 入れるのは `sb_publishable_...` のキー
- Vercel URL が決まったら Supabase の Redirect URLs を必ず更新する
- `/lp/test-lp` などの公開URLは、画像を入れてから確認する

