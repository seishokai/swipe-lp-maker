export type LandingPageStatus = "draft" | "published" | "archived";

export type CtaArea = {
  id: string;
  lp_image_id: string;
  label: string | null;
  url: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
};

export type LpImage = {
  id: string;
  lp_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  cta_areas?: CtaArea[];
};

export type LandingPage = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: LandingPageStatus;
  cta_url: string | null;
  meta_pixel_id: string | null;
  google_analytics_id: string | null;
  custom_head_tags: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LandingPageWithImages = LandingPage & {
  lp_images: Array<LpImage & { cta_areas: CtaArea[] }>;
};
