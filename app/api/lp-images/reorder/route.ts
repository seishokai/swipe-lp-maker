import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { reorderImages } from "@/lib/lp-images";

export async function POST(request: Request) {
  const { supabase } = await requireUser();
  const { imageIds } = await request.json();

  if (!Array.isArray(imageIds)) {
    return NextResponse.json({ error: "imageIds must be an array." }, { status: 400 });
  }

  await reorderImages(supabase, imageIds.map(String));
  return NextResponse.json({ ok: true });
}
