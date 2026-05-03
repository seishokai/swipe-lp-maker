import { redirect } from "next/navigation";

export default async function LpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/lps/${id}/edit`);
}
