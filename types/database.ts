import type { CtaArea, LandingPage, LpImage } from "@/types/lp";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      landing_pages: {
        Row: LandingPage;
        Insert: Partial<LandingPage> & Pick<LandingPage, "user_id" | "title" | "slug">;
        Update: Partial<LandingPage>;
      };
      lp_images: {
        Row: LpImage;
        Insert: Partial<LpImage> & Pick<LpImage, "lp_id" | "storage_path" | "public_url">;
        Update: Partial<LpImage>;
      };
      cta_areas: {
        Row: CtaArea;
        Insert: Partial<CtaArea> & Pick<CtaArea, "lp_image_id" | "x" | "y" | "width" | "height">;
        Update: Partial<CtaArea>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_published_lp: {
        Args: { p_slug: string };
        Returns: Json;
      };
    };
  };
};
