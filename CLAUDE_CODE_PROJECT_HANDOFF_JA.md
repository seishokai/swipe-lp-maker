# Claude Code向けプロジェクト引き継ぎ資料

このファイルは目次です。詳細な引き継ぎ資料は以下にまとめています。

```text
handoff/claude-code/
  00_START_HERE_CLAUDE_PROMPT_JA.md
  01_PROJECT_STATUS_JA.md
  02_TECHNICAL_NOTES_JA.md
  03_QA_CHECKLIST_JA.md
  04_NEXT_WORK_PROMPT_JA.md
  05_GENSPARK_TRAINING_PROMPT_JA.md
  06_ENV_TEMPLATE.txt
```

## プロジェクト

- 本番URL: https://swipe-lp-maker.vercel.app
- GitHub: https://github.com/seishokai/swipe-lp-maker
- Supabase: https://ndlfqrvoejwgqfdtghmg.supabase.co

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Database / Storage
- Vercel

## 重要方針

- 回答とUIは日本語中心。
- ユーザーは「使いやすさ」「おしゃれさ」「迷わない編集画面」を重視。
- 公開LPはスマホファースト。黒帯や不自然な縮小表示を避ける。
- 画像/動画の一括アップロード、並び替え、削除、CTA設定を特に磨き込む。
- 秘密情報はGitに入れない。

## 検証コマンド

```powershell
npm run typecheck
npm run build
```

## 文字化けチェック

```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css -File app,components,lib,types |
  Select-String -Pattern '繧|縺|蜈|逕|譁|險|菫|荳|鬮|蟷|髢|螳|邱|蜍|驥|謫|譫|蝓|髱|螟|遐|雉|侭|諷|邂'
```
