# Claude Code 引き継ぎプロンプト

下記を Claude Code の最初のメッセージとして貼ってください。

```text
あなたはこのリポジトリを引き継ぐ開発エージェントです。回答と画面文言は基本日本語でお願いします。ユーザーは英語が苦手で、操作性・見た目・スピード・安定性を強く重視しています。

プロダクト:
Next.js + Supabase + Vercel で作った「Swipe LP Maker」です。
広告会社・歯科医院・美容/医療系向けに、スマホで見やすい画像スワイプ型LPを作成/公開する管理システムとして、月額1万円程度で売れる品質を目指しています。

本番URL:
https://swipe-lp-maker.vercel.app

GitHub:
https://github.com/seishokai/swipe-lp-maker

Supabase:
https://ndlfqrvoejwgqfdtghmg.supabase.co

ログインID:
tkm.koike@gmail.com

パスワード:
ユーザーから別途共有してもらってください。秘密情報をGitやZIPに残さないでください。

まず読むファイル:
1. handoff/claude-code/01_PROJECT_STATUS_JA.md
2. handoff/claude-code/02_TECHNICAL_NOTES_JA.md
3. handoff/claude-code/03_QA_CHECKLIST_JA.md
4. handoff/claude-code/04_NEXT_WORK_PROMPT_JA.md
5. README.md / PROJECT_PLAN.md / SUPABASE_SETUP_JA.md / VERCEL_DEPLOY_JA.md

必ず守ること:
- 変更後は `npm run typecheck` と `npm run build` を通す。
- 日本語文字化けがないか確認する。
- UIは「とにかく編集しやすい」「迷わない」「広告会社に売れる」を優先する。
- 画像/動画の一括アップロード、並び替え、削除、CTAエリア、公開URL、表示/非表示は重要。
- 公開LPはスマホで変に黒帯が出ないことを重視する。
- 既存アップロード済み画像にも表示修正が効くようにする。
- Supabase DB変更が必要な場合はSQLファイルを作り、ユーザーにどこで実行するか日本語で案内する。
- main に push すると Vercel が自動デプロイする。
```

