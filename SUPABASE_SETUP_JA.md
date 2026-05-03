# Supabase 設定メモ

## すでに完了

- DB schema 作成
- RLS policy 作成
- Storage bucket `lp-images` 作成
- Storage policy 作成
- `.env.local` 設定

## Authentication URL Configuration

Supabase Dashboard の `Authentication -> URL Configuration` で以下を設定する。

### Site URL

```txt
http://localhost:3000
```

### Redirect URLs

```txt
http://localhost:3000/callback
http://localhost:3000/reset-password
```

設定後にメールリンクが古い場合は、必ず新しいメールを送り直す。

## ログイン方法

### パスワードがある場合

1. `http://localhost:3000/login` を開く
2. メールアドレスを入力
3. パスワードを入力
4. `パスワードでログイン` を押す

### パスワードがない場合

1. `http://localhost:3000/login` を開く
2. メールアドレスを入力
3. `パスワード再設定リンクを送信` を押す
4. Gmail に届いた最新の再設定メールを開く
5. `/reset-password` で新しいパスワードを設定
6. `/login` でログイン

## 注意

- 古い再設定メールは使わない
- `Email link is invalid or has expired` が出たら、新しい再設定リンクを送る
- `email rate limit exceeded` が出たら、Supabase のメール送信上限に当たっているので少し待つ
- 再設定リンクが `/login?#access_token...` に戻ってきても、アプリ側で `/reset-password` に自動転送する
- Supabase の `Secret key` は `.env.local` に入れない
- `.env.local` に入れるのは `sb_publishable_...` のキー

## 動作確認の順番

1. `/login` でログイン
2. `/dashboard/lps/new` で LP 作成
3. 編集画面で画像をアップロード
4. 画像をドラッグして並び替え
5. 画像上をドラッグして CTA エリアを作成
6. `公開する` を押す
7. 公開 URL またはスマホプレビューで確認
