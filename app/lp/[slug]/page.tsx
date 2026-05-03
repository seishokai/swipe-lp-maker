import { notFound } from "next/navigation";
import { SwipeLpViewer } from "@/components/lp/swipe-lp-viewer";
import { TrackingTags } from "@/lib/tracking-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LandingPageWithImages } from "@/types/lp";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("landing_pages").select("title").eq("slug", slug).eq("status", "published").single();

  return {
    title: data?.title || "LP",
  };
}

export default async function PublicLpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*, lp_images(*, cta_areas(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .order("sort_order", { referencedTable: "lp_images", ascending: true })
    .single();

  if (error || !data) notFound();

  const lp = data as LandingPageWithImages;

  return (
    <>
      <TrackingTags metaPixelId={lp.meta_pixel_id} googleAnalyticsId={lp.google_analytics_id} />
      <SwipeLpViewer lp={{ ...lp, lp_images: [...lp.lp_images].sort((a, b) => a.sort_order - b.sort_order) }} />
    </>
  );
}
