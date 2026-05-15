"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TrainingAssetType } from "@/types/training";

const MAX_FILES = 10;
const MAX_BYTES = 120 * 1024 * 1024;

function getAssetType(file: File): TrainingAssetType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "file";
}

export function TrainingAssetUploader({
  userId,
  courseId,
  sectionId,
}: {
  userId: string;
  courseId: string;
  sectionId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState("");
  const [isPending, startTransition] = useTransition();
  const overLimit = files.length > MAX_FILES;

  async function upload() {
    setMessage("");
    setProgress("");

    if (files.length === 0) return setMessage("追加するファイルを選んでください。");
    if (files.length > MAX_FILES) return setMessage(`一度に追加できるのは${MAX_FILES}件までです。`);
    if (files.some((file) => file.size > MAX_BYTES)) return setMessage("1ファイル120MBまでです。");

    const uploadedPaths: string[] = [];

    try {
      const rows = [];
      for (const [index, file] of files.entries()) {
        setProgress(`${index + 1}/${files.length} 件目をアップロード中...`);
        const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `${userId}/${courseId}/${sectionId}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("training-assets").upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) throw error;
        uploadedPaths.push(path);
        rows.push({
          storage_path: path,
          public_url: supabase.storage.from("training-assets").getPublicUrl(path).data.publicUrl,
          file_name: file.name,
          asset_type: getAssetType(file),
        });
      }

      const response = await fetch("/api/training-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_id: sectionId, files: rows }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "ファイル情報の保存に失敗しました。");
      }

      setFiles([]);
      setProgress("");
      setMessage("追加しました。");
      startTransition(() => router.refresh());
    } catch (error) {
      if (uploadedPaths.length > 0) await supabase.storage.from("training-assets").remove(uploadedPaths);
      setProgress("");
      setMessage(error instanceof Error ? error.message : "アップロードに失敗しました。");
    }
  }

  return (
    <div className="rounded-md border border-dashed border-line bg-mist/50 p-3">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={(event) => setFiles(Array.from(event.currentTarget.files || []))}
          className="h-10 rounded-md border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
        />
        <Button type="button" disabled={isPending || files.length === 0 || overLimit} onClick={upload}>
          <FileUp size={16} />
          {files.length > 0 ? `${files.length}件追加` : "資料追加"}
        </Button>
      </div>
      <p className={`mt-2 text-xs ${overLimit ? "font-semibold text-red-700" : "text-slate-500"}`}>
        選択中: {files.length}/{MAX_FILES}件 / 画像・動画・PDF対応 / 1ファイル120MBまで
      </p>
      {progress ? <p className="mt-2 text-sm font-semibold text-accent">{progress}</p> : null}
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
