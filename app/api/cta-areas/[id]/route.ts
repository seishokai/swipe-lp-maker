import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deleteCtaArea } from "@/lib/cta-areas";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await deleteCtaArea(supabase, user.id, id);
  return NextResponse.json({ ok: true });
}
