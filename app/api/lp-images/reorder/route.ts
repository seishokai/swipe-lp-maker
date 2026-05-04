import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { reorderImages } from "@/lib/lp-images";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const { lpId, imageIds } = await request.json();

  if (!lpId || !Array.isArray(imageIds)) {
    return NextResponse.json({ error: "lpId and imageIds are required." }, { status: 400 });
  }

  await reorderImages(supabase, String(lpId), user.id, imageIds.map(String));
  return NextResponse.json({ ok: true });
}
