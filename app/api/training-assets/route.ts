import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createTrainingAssetRows } from "@/lib/training-assets";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const body = await request.json();
  const sectionId = String(body.section_id || "");
  const files = Array.isArray(body.files) ? body.files : [];

  if (!sectionId || files.length === 0) {
    return NextResponse.json({ error: "セクションIDとファイル情報が必要です。" }, { status: 400 });
  }

  await createTrainingAssetRows(supabase, sectionId, user.id, files);
  return NextResponse.json({ ok: true }, { status: 201 });
}
