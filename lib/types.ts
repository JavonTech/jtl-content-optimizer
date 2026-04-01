export type Platform = "LinkedIn" | "Instagram" | "X" | "Facebook";

export interface Post {
  id: string;
  created_at: string;
  platform: Platform;
  content_type: string;
  topic: string;
  cta_goal: string;
  generated_text: string;
  posted_at: string | null;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  impressions: number;
  kajabi_revenue: number;
}

export interface PostWithMetrics extends Post {
  engagement_total: number;
  engagement_rate: number;
}

