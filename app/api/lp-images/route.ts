import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createImageRecord } from "@/lib/lp-images";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  const lpId = String(formData.get("lp_id") || "");
  const file = formData.get("image");

  if (!(file instanceof File) || !lpId) {
    return NextResponse.json({ error: "lp_id and image are required." }, { status: 400 });
  }

  await createImageRecord(supabase, lpId, user.id, file);
  return NextResponse.json({ ok: true }, { status: 201 });
}
