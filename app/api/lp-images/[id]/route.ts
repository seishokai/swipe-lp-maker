import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deleteImageRecord } from "@/lib/lp-images";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await deleteImageRecord(supabase, id, user.id);
  return NextResponse.json({ ok: true });
}
