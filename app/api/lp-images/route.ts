import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createImageRecords, createUploadedImageRows } from "@/lib/lp-images";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const lpId = String(body.lp_id || "");
    const files = Array.isArray(body.files) ? body.files : [];

    if (!lpId || files.length === 0) {
      return NextResponse.json({ error: "LP IDとファイル情報が必要です。" }, { status: 400 });
    }

    await createUploadedImageRows(supabase, lpId, user.id, files);
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const formData = await request.formData();
  const lpId = String(formData.get("lp_id") || "");
  const files = [...formData.getAll("images"), ...formData.getAll("image")]
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0 || !lpId) {
    return NextResponse.json({ error: "LP IDと画像/動画が必要です。" }, { status: 400 });
  }

  await createImageRecords(supabase, lpId, user.id, files);
  return NextResponse.json({ ok: true }, { status: 201 });
}
