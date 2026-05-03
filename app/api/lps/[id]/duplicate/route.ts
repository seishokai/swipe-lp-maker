import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { duplicateLandingPage } from "@/lib/lps";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const data = await duplicateLandingPage(supabase, id, user.id);
  return NextResponse.json({ data }, { status: 201 });
}
