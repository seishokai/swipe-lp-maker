import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { setPublishStatus } from "@/lib/lps";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { publish } = await request.json();
  const { supabase, user } = await requireUser();
  await setPublishStatus(supabase, id, user.id, Boolean(publish));
  return NextResponse.json({ ok: true });
}
