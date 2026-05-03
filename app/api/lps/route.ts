import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createLandingPage, listLandingPages } from "@/lib/lps";

export async function GET() {
  const { supabase, user } = await requireUser();
  const data = await listLandingPages(supabase, user.id);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  const data = await createLandingPage(supabase, user.id, formData);
  return NextResponse.json({ data }, { status: 201 });
}
