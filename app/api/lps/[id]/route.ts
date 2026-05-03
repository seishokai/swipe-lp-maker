import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getLandingPage, updateLandingPage } from "@/lib/lps";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const data = await getLandingPage(supabase, id, user.id);
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  await updateLandingPage(supabase, id, user.id, formData);
  return NextResponse.json({ ok: true });
}
