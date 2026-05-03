# Swipe LP Maker: Initial Design

Next.js + Supabase + Vercel で構築する、スマホ特化の縦スワイプ LP メーカーの初期設計です。

## 目的

画像をアップロードし、Instagram ストーリーのように縦スワイプできる LP を管理画面から作成・編集・公開できるシステムを作る。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Vercel

## 推奨ディレクトリ構成

```txt
.
├── app
│   ├── (auth)
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── callback
│   │       └── route.ts
│   ├── (dashboard)
│   │   ├── layout.tsx
│   │   └── dashboard
│   │       └── lps
│   │           ├── page.tsx
│   │           ├── new
│   │           │   └── page.tsx
│   │           └── [id]
│   │               ├── page.tsx
│   │               └── edit
│   │                   └── page.tsx
│   ├── lp
│   │   └── [slug]
│   │       ├── page.tsx
│   │       └── not-found.tsx
│   ├── api
│   │   ├── lps
│   │   │   ├── route.ts
│   │   │   └── [id]
│   │   │       ├── route.ts
│   │   │       ├── duplicate
│   │   │       │   └── route.ts
│   │   │       └── publish
│   │   │           └── route.ts
│   │   ├── lp-images
│   │   │   ├── route.ts
│   │   │   └── reorder
│   │   │       └── route.ts
│   │   └── cta-areas
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components
│   ├── dashboard
│   │   ├── lp-list.tsx
│   │   ├── lp-form.tsx
│   │   ├── image-uploader.tsx
│   │   ├── sortable-image-list.tsx
│   │   ├── cta-area-editor.tsx
│   │   └── publish-toggle.tsx
│   ├── lp
│   │   ├── swipe-lp-viewer.tsx
│   │   ├── swipe-slide.tsx
│   │   └── transparent-cta-link.tsx
│   └── ui
├── lib
│   ├── supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── lps.ts
│   ├── lp-images.ts
│   ├── cta-areas.ts
│   ├── duplicate-lp.ts
│   ├── slug.ts
│   └── tracking-tags.ts
├── middleware.ts
├── supabase
│   ├── migrations
│   │   └── 0001_initial_schema.sql
│   └── storage-policies.sql
├── types
│   ├── database.ts
│   └── lp.ts
├── public
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## ルーティング設計

| ルート | 用途 | 認証 |
| --- | --- | --- |
| `/login` | ログイン | 不要 |
| `/dashboard/lps` | LP 一覧 | 必須 |
| `/dashboard/lps/new` | LP 新規作成 | 必須 |
| `/dashboard/lps/[id]` | LP 詳細 | 必須 |
| `/dashboard/lps/[id]/edit` | LP 編集 | 必須 |
| `/lp/[slug]` | 公開 LP | 不要 |

公開 LP は `/lp/[slug]` に固定する。管理画面の ID は UUID、公開 URL は slug を使う。

## DB 設計

### `profiles`

Supabase Auth の `auth.users` に紐づく管理ユーザー情報。

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | uuid primary key | `auth.users.id` |
| `email` | text | メールアドレス |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

### `landing_pages`

LP 本体。

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | uuid primary key | LP ID |
| `user_id` | uuid | 作成者 |
| `title` | text | 管理用タイトル |
| `slug` | text unique | 公開 URL 用 slug |
| `status` | text | `draft` / `published` / `archived` |
| `cta_url` | text | デフォルト CTA URL |
| `meta_pixel_id` | text nullable | Meta Pixel ID |
| `google_analytics_id` | text nullable | GA4 Measurement ID |
| `custom_head_tags` | text nullable | 将来拡張用。必要なら制限付きで利用 |
| `published_at` | timestamptz nullable | 公開日時 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

制約:

- `status in ('draft', 'published', 'archived')`
- `slug` は全ユーザーで一意
- `cta_url` は LP 共通の遷移先として持つ

### `lp_images`

LP 内の各画像スライド。

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | uuid primary key | 画像 ID |
| `lp_id` | uuid | `landing_pages.id` |
| `storage_path` | text | Supabase Storage path |
| `public_url` | text | 公開表示用 URL |
| `alt_text` | text nullable | 代替テキスト |
| `width` | integer nullable | 元画像幅 |
| `height` | integer nullable | 元画像高さ |
| `sort_order` | integer | 表示順 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

制約:

- `(lp_id, sort_order)` に index
- 並び替えは `sort_order` を一括更新
- LP 複製時はレコードを複製し、Storage ファイルもコピーする

### `cta_areas`

画像内 CTA の透明クリックエリア。

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | uuid primary key | CTA エリア ID |
| `lp_image_id` | uuid | `lp_images.id` |
| `label` | text nullable | 管理用ラベル |
| `url` | text nullable | 個別 CTA URL。未設定なら LP の `cta_url` を使う |
| `x` | numeric | 左上 X。画像幅に対する 0-1 の比率 |
| `y` | numeric | 左上 Y。画像高さに対する 0-1 の比率 |
| `width` | numeric | 幅。画像幅に対する 0-1 の比率 |
| `height` | numeric | 高さ。画像高さに対する 0-1 の比率 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

制約:

- `x >= 0 and x <= 1`
- `y >= 0 and y <= 1`
- `width > 0 and width <= 1`
- `height > 0 and height <= 1`
- `x + width <= 1`
- `y + height <= 1`

CTA エリアは px ではなく比率で保存する。画像サイズや端末サイズが変わっても、画像上の同じ位置に透明リンクを重ねられる。

## 初期 SQL

```sql
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cta_url text,
  meta_pixel_id text,
  google_analytics_id text,
  custom_head_tags text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lp_images (
  id uuid primary key default gen_random_uuid(),
  lp_id uuid not null references public.landing_pages(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cta_areas (
  id uuid primary key default gen_random_uuid(),
  lp_image_id uuid not null references public.lp_images(id) on delete cascade,
  label text,
  url text,
  x numeric not null check (x >= 0 and x <= 1),
  y numeric not null check (y >= 0 and y <= 1),
  width numeric not null check (width > 0 and width <= 1),
  height numeric not null check (height > 0 and height <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (x + width <= 1),
  check (y + height <= 1)
);

create index landing_pages_user_id_idx on public.landing_pages(user_id);
create index landing_pages_slug_status_idx on public.landing_pages(slug, status);
create index lp_images_lp_id_sort_order_idx on public.lp_images(lp_id, sort_order);
create index cta_areas_lp_image_id_idx on public.cta_areas(lp_image_id);
```

## RLS 設計

```sql
alter table public.profiles enable row level security;
alter table public.landing_pages enable row level security;
alter table public.lp_images enable row level security;
alter table public.cta_areas enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can manage own landing pages"
on public.landing_pages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage images for own landing pages"
on public.lp_images for all
using (
  exists (
    select 1 from public.landing_pages
    where landing_pages.id = lp_images.lp_id
      and landing_pages.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.landing_pages
    where landing_pages.id = lp_images.lp_id
      and landing_pages.user_id = auth.uid()
  )
);

create policy "Users can manage CTA areas for own landing pages"
on public.cta_areas for all
using (
  exists (
    select 1
    from public.lp_images
    join public.landing_pages on landing_pages.id = lp_images.lp_id
    where lp_images.id = cta_areas.lp_image_id
      and landing_pages.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lp_images
    join public.landing_pages on landing_pages.id = lp_images.lp_id
    where lp_images.id = cta_areas.lp_image_id
      and landing_pages.user_id = auth.uid()
  )
);
```

公開 LP 表示は Server Component / Route Handler で Supabase service role を使わず、`status = 'published'` のデータだけ取得する専用 RPC か公開 read policy を使う。

推奨は専用 RPC:

```sql
create or replace function public.get_published_lp(p_slug text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'lp', row_to_json(lp),
    'images', coalesce(json_agg(
      json_build_object(
        'id', img.id,
        'public_url', img.public_url,
        'alt_text', img.alt_text,
        'width', img.width,
        'height', img.height,
        'sort_order', img.sort_order,
        'cta_areas', coalesce((
          select json_agg(area order by area.created_at)
          from public.cta_areas area
          where area.lp_image_id = img.id
        ), '[]'::json)
      )
      order by img.sort_order
    ) filter (where img.id is not null), '[]'::json)
  )
  from public.landing_pages lp
  left join public.lp_images img on img.lp_id = lp.id
  where lp.slug = p_slug
    and lp.status = 'published'
  group by lp.id;
$$;
```

## Storage 設計

Bucket:

- `lp-images`

Path:

```txt
lp-images/{user_id}/{lp_id}/{image_id}.{ext}
```

複製時:

```txt
lp-images/{user_id}/{new_lp_id}/{new_image_id}.{ext}
```

Storage policy:

- 認証ユーザーは自分の `{user_id}` 配下のみ upload/update/delete 可能
- 公開 LP 用画像は public bucket にする、または signed URL ではなく Supabase CDN の public URL を使う
- 画像が公開 LP の主コンテンツなので、初期版は public bucket 推奨

注意:

- DB の公開/非公開は `landing_pages.status` で制御する
- Storage の public URL 自体は知っていれば見られるため、厳密な非公開画像が必要なら private bucket + signed URL に切り替える
- LP の公開/非公開が主目的なら public bucket で十分

## 公開 LP 表示仕様

`/lp/[slug]` の挙動:

- `status = 'published'` の LP だけ表示
- 未公開、存在しない slug は `404`
- 画像を `sort_order asc` で表示
- 画面全体に縦方向 `scroll-snap`
- 固定 CTA は置かない
- 各画像の CTA エリアだけ透明リンクを重ねる
- 画像は `object-fit: contain` を基本にする
- 背景は黒または LP ごとの背景色にする
- 画像の表示領域と CTA エリアの座標変換を揃える

基本 CSS:

```css
.lp-viewer {
  height: 100svh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.lp-slide {
  position: relative;
  height: 100svh;
  scroll-snap-align: start;
  display: grid;
  place-items: center;
  background: #000;
}

.lp-slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cta-area {
  position: absolute;
  display: block;
  background: transparent;
}
```

CTA 座標は、画像が `object-fit: contain` で letterbox される点を考慮し、実際に描画された画像矩形に対して配置する。

## CTA エリア設計

管理画面:

- 画像プレビュー上でドラッグして CTA 範囲を作成
- 範囲は `x`, `y`, `width`, `height` を 0-1 の比率で保存
- エリアごとに URL を指定可能
- URL 未指定なら LP 共通の `cta_url` を使う
- 複数 CTA エリア対応

公開画面:

- 透明な `<a>` を画像上に絶対配置
- `aria-label` は `label` または LP タイトルから生成
- クリック計測用に将来 `cta_click_events` テーブルを追加可能

## 並び替え設計

管理画面:

- `@dnd-kit` などで画像をドラッグ並び替え
- 並び替え完了時に配列順で `sort_order` を再採番
- API `/api/lp-images/reorder` に `{ lpId, imageIds }` を送る

DB 更新:

- `imageIds[0]` を `sort_order = 0`
- `imageIds[1]` を `sort_order = 1`
- 一括更新は transaction で行う

## LP 複製設計

複製対象:

- `landing_pages`
- `lp_images`
- `cta_areas`
- Storage 内の画像ファイル

複製時の変更:

- `id`: 新規 UUID
- `slug`: `original-slug-copy` などで一意生成
- `title`: `元タイトル のコピー`
- `status`: `draft`
- `published_at`: `null`
- `created_at`, `updated_at`: 現在時刻

API:

- `POST /api/lps/[id]/duplicate`

処理順:

1. 複製元 LP の所有者確認
2. 新 LP 作成
3. 画像ファイルを Storage 上でコピー
4. `lp_images` を新 LP に紐づけて作成
5. 各画像の `cta_areas` を複製
6. 新 LP ID を返す

## 公開 / 非公開設計

状態:

- `draft`: 非公開
- `published`: 公開
- `archived`: アーカイブ、非公開

公開切替:

- `draft -> published`: `published_at = now()`
- `published -> draft`: `published_at` は保持してもよいが、初期版では `null` に戻す

公開 URL:

```txt
https://example.com/lp/{slug}
```

公開可否:

- `/lp/[slug]` で `status = 'published'` のみ取得
- 非公開 LP は 404

## トラッキングタグ設計

入力欄:

- Meta Pixel ID
- Google Analytics Measurement ID

公開 LP:

- `meta_pixel_id` があれば Meta Pixel script を出力
- `google_analytics_id` があれば GA4 script を出力

初期版では任意 HTML の全面入力は避ける。`custom_head_tags` は将来用として保持しても、管理者限定・サニタイズ前提にする。

## 実装ステップ

1. Next.js プロジェクト作成
   - App Router
   - TypeScript
   - Tailwind CSS
   - ESLint

2. Supabase 接続
   - `.env.example` 作成
   - browser client
   - server client
   - middleware

3. Auth 実装
   - `/login`
   - callback route
   - dashboard 保護

4. DB migration 作成
   - `profiles`
   - `landing_pages`
   - `lp_images`
   - `cta_areas`
   - RLS
   - indexes

5. Storage bucket / policy 作成
   - `lp-images`
   - `{user_id}/{lp_id}/{image_id}.{ext}` path

6. LP 一覧
   - 自分の LP のみ表示
   - 公開状態、画像枚数、更新日時
   - 編集、複製、公開 URL 導線

7. LP 新規作成
   - title
   - slug
   - cta_url
   - tracking IDs
   - 初期 status は `draft`

8. LP 編集
   - 基本情報編集
   - 画像アップロード
   - 画像一覧
   - 並び替え
   - 画像削除
   - CTA エリア編集

9. 画像アップロード
   - Supabase Storage upload
   - 画像サイズ取得
   - `lp_images` 作成
   - `sort_order` は末尾

10. CTA エリア設定
    - 画像プレビュー上で矩形作成
    - 比率座標で保存
    - 複数エリア対応

11. 並び替え
    - drag and drop
    - `sort_order` 一括更新

12. 公開 / 非公開切替
    - status 更新
    - published_at 更新
    - 公開 URL 表示

13. LP 複製
    - LP / images / CTA areas / Storage を複製
    - 複製後は draft

14. 公開 LP
    - `/lp/[slug]`
    - scroll-snap
    - full viewport slide
    - transparent CTA links
    - tracking tags
    - 404 handling

15. Vercel deploy
    - Environment Variables
    - Supabase URL / anon key
    - Supabase service role は必要最小限

## 確認ポイント

| 確認項目 | 状態 | 内容 |
| --- | --- | --- |
| ディレクトリ構成が正しいか | OK | App Router、dashboard、公開 LP、API、Supabase、components を分離 |
| DB 設計が足りているか | OK | LP、画像、CTA エリア、Auth 紐付け、公開状態、計測 ID を保持 |
| Storage 設計が正しいか | OK | `lp-images/{user_id}/{lp_id}/{image_id}.{ext}` で所有者と LP 単位に整理 |
| LP 公開ルートが適切か | OK | `/lp/[slug]` を公開 URL とし、管理 ID と分離 |
| CTA エリア設計が入っているか | OK | `cta_areas` に比率座標で保存し、透明リンクで表示 |
| 並び替え設計があるか | OK | `lp_images.sort_order` と reorder API で対応 |
| 複製機能があるか | OK | LP、画像、CTA、Storage コピーまで含む |
| 公開/非公開設計があるか | OK | `landing_pages.status` と `/lp/[slug]` の published 判定で対応 |

## MVP の優先順位

最初の MVP は以下の順で作る。

1. Auth + LP CRUD
2. 画像 upload + sort_order
3. CTA area editor
4. `/lp/[slug]` 公開表示
5. 公開 / 非公開切替
6. 複製
7. Meta Pixel / GA4

