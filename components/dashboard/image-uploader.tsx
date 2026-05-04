"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Images, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_FILES = 20;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function validateFile(file: File) {
  const isVideo = file.type.startsWith("video/");
  const allowed = isVideo ? ALLOWED_VIDEO_TYPES.has(file.type) : ALLOWED_IMAGE_TYPES.has(file.type);
  const maxSize = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!allowed) {
    return `${file.name} は未対応です。JPG / PNG / WebP / GIF / MP4 / WebM / MOV を選んでください。`;
  }
  if (file.size > maxSize) {
    return `${file.name} が大きすぎます。画像は20MB、動画は120MBまでです。`;
  }
  return null;
}

export function ImageUploader({ lpId, userId }: { lpId: string; userId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedCount = files.length;

  async function uploadSelectedFiles() {
    setMessage("");
    setProgress("");

    if (files.length === 0) {
      setMessage("追加する画像または動画を選んでください。");
      return;
    }
    if (files.length > MAX_FILES) {
      setMessage(`一度に追加できるのは${MAX_FILES}件までです。`);
      return;
    }

    const validationError = files.map(validateFile).find(Boolean);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    const uploadedPaths: string[] = [];

    try {
      const rows = [];

      for (const [index, file] of files.entries()) {
        setProgress(`${index + 1}/${files.length} 件目をアップロード中...`);
        const extension = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
        const mediaType = file.type.startsWith("video/") ? "video" : "image";
        const path = `${userId}/${lpId}/${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage.from("lp-images").upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

        if (error) throw error;
        uploadedPaths.push(path);
        rows.push({
          storage_path: path,
          public_url: supabase.storage.from("lp-images").getPublicUrl(path).data.publicUrl,
          alt_text: file.name,
          media_type: mediaType,
        });
      }

      setProgress("一覧に反映中...");
      const response = await fetch("/api/lp-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lp_id: lpId, files: rows }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "画像情報の保存に失敗しました。");
      }

      setFiles([]);
      setMessage("追加しました。");
      setProgress("");
      startTransition(() => router.refresh());
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("lp-images").remove(uploadedPaths);
      }
      setProgress("");
      setMessage(error instanceof Error ? error.message : "アップロードに失敗しました。");
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-accent/45 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
            <Images size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">画像・動画をまとめて追加</h2>
            <p className="mt-1 text-sm text-slate-600">複数ファイルを一気に選べます。追加後、下の一覧で順番を調整できます。</p>
            <p className="mt-1 text-xs text-slate-400">対応: JPG / PNG / WebP / GIF / MP4 / WebM / MOV</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] md:w-[520px]">
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(event) => setFiles(Array.from(event.currentTarget.files || []))}
            className="h-11 rounded-md border border-line bg-paper px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          <Button type="button" className="h-11" disabled={isPending || selectedCount === 0} onClick={uploadSelectedFiles}>
            <UploadCloud size={18} />
            {progress ? "追加中..." : selectedCount > 0 ? `${selectedCount}件を追加` : "まとめて追加"}
          </Button>
        </div>
      </div>
      {progress ? <p className="mt-3 text-sm font-semibold text-accent">{progress}</p> : null}
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
