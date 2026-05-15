export type TrainingStatus = "draft" | "published" | "archived";
export type TrainingAssetType = "image" | "video" | "pdf" | "file";

export type TrainingAsset = {
  id: string;
  section_id: string;
  storage_path: string;
  public_url: string;
  file_name: string | null;
  asset_type: TrainingAssetType;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TrainingSection = {
  id: string;
  course_id: string;
  title: string;
  body: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  training_assets?: TrainingAsset[];
};

export type TrainingCourse = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: TrainingStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingCourseWithSections = TrainingCourse & {
  training_sections: Array<TrainingSection & { training_assets: TrainingAsset[] }>;
};
