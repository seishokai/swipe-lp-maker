import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { upsertCtaArea } from "@/lib/cta-areas";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  await upsertCtaArea(supabase, user.id, formData);
  return NextResponse.json({ ok: true }, { status: 201 });
}
