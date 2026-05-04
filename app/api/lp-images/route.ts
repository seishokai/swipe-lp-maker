import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createImageRecords } from "@/lib/lp-images";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  const lpId = String(formData.get("lp_id") || "");
  const files = [...formData.getAll("images"), ...formData.getAll("image")]
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0 || !lpId) {
    return NextResponse.json({ error: "lp_id and image/images are required." }, { status: 400 });
  }

  await createImageRecords(supabase, lpId, user.id, files);
  return NextResponse.json({ ok: true }, { status: 201 });
}
