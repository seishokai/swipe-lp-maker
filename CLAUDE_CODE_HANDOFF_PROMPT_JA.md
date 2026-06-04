# Claude Code 引継ぎプロンプト

以下をClaude Codeの最初のメッセージとして貼ってください。

```text
あなたはこのリポジトリを引き継ぐ開発エージェントです。
日本語で返答してください。ユーザーは英語が苦手なので、画面文言・説明・エラー表示は基本日本語にしてください。

目的：
Next.js + Supabase + Vercelで構築した「Swipe LP Maker」と「研修資料管理」を継続開発してください。
このプロダクトは、広告会社・歯科医院・医療法人向けに、スマホで見やすいLPや研修資料を簡単に作成・公開する管理システムです。

現在の本番URL：
https://swipe-lp-maker.vercel.app

ログイン：
ID: tkm.koike@gmail.com
パスワード: Edoyadepon1

GitHub：
https://github.com/seishokai/swipe-lp-maker

Supabase：
Project URL: https://ndlfqrvoejwgqfdtghmg.supabase.co
Publishable key:
sb_publishable_JPzgVHsAUdW-qSGy2_G5fw_kEPCMF3w

技術スタック：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Vercel

まず必ずやること：
1. README.md、PROJECT_PLAN.md、SUPABASE_SETUP_JA.md、VERCEL_DEPLOY_JA.md を読む
2. CLAUDE_CODE_PROJECT_HANDOFF_JA.md を読む
3. package.json を確認する
4. `npm run typecheck` と `npm run build` を実行して現状確認する
5. 文字化けが残っていないか確認する
   - 検索例: 繧 / 縺 / 蜈 / 譁 / 螳 / 邱 / 遐 / 雉 など

重要な注意：
- ユーザーは「使いやすさ」「おしゃれさ」「迷わない操作性」を強く重視しています。
- 管理画面は初心者でも直感的に操作できるようにしてください。
- 特に画像/動画アップロード、並び替え、削除、公開URL、公開/非公開は分かりやすくしてください。
- 変更後は必ず typecheck と build を通してください。
- Vercel反映前提なので、GitHub main にpushすると自動デプロイされます。
- Supabaseに新テーブルを追加した場合は、SQL Editorで実行するSQLを必ず明記してください。
- DB未適用で画面が500にならないよう、可能なら日本語のセットアップ案内を出してください。

現状実装済み：
1. Swipe LP Maker
   - LP一覧
   - LP新規作成
   - LP編集
   - 画像/動画まとめてアップロード
   - 並び替え
   - 削除
   - 画像内CTAエリア
   - 固定CTA
   - 公開/非公開
   - 複製
   - Meta Pixel / Google Analytics
   - 公開URL `/lp/[slug]`
   - PC表示切替: スマホ比率 / 画面いっぱい / 全画面

2. 研修資料管理
   - 研修一覧 `/dashboard/trainings`
   - 新規作成 `/dashboard/trainings/new`
   - 編集 `/dashboard/trainings/[id]/edit`
   - 公開ページ `/training/[slug]`
   - セクション追加/編集/削除
   - 画像/動画/PDFアップロード
   - 公開/非公開
   - 複製

研修資料管理の注意：
`supabase/migrations/0003_training_courses.sql` をSupabase SQL Editorで実行しないと、研修用DBテーブルがありません。
現状はDB未適用でも `/dashboard/trainings` が500で落ちず、日本語のセットアップ案内を出すようになっています。

今後の優先改善案：
1. 研修用DB SQLが本番Supabaseに適用済みか確認
2. 研修資料管理のUIをさらに洗練
3. 研修資料の受講完了チェック・閲覧履歴
4. LP/研修のテンプレート機能
5. SaaS化に向けたユーザー/組織/課金管理
6. UIのさらなるブランド化
7. スマホ実機で公開LPと研修ページの表示確認

作業方針：
- まず既存コードを読んで、既存パターンに合わせて実装してください。
- 不要な大規模リファクタは避けてください。
- ユーザーが急いでいることが多いので、できるだけ止まらず進めてください。
- ただし本番に影響するDB変更・環境変数・削除系は、何をするか明確に説明してください。
```

