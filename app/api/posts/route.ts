export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { Post, PostWithMetrics } from "@/lib/types";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    const posts: PostWithMetrics[] = (data as Post[]).map((p) => {
      const engagement_total = p.likes + p.comments + p.shares + p.clicks;
      const engagement_rate =
        p.impressions > 0 ? (engagement_total / p.impressions) * 100 : 0;
      return { ...p, engagement_total, engagement_rate };
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
