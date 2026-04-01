import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      likes,
      comments,
      shares,
      clicks,
      impressions,
      kajabi_revenue,
      posted_at,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const update: Record<string, unknown> = {};
    if (likes !== undefined) update.likes = Number(likes);
    if (comments !== undefined) update.comments = Number(comments);
    if (shares !== undefined) update.shares = Number(shares);
    if (clicks !== undefined) update.clicks = Number(clicks);
    if (impressions !== undefined) update.impressions = Number(impressions);
    if (kajabi_revenue !== undefined) update.kajabi_revenue = Number(kajabi_revenue);
    if (posted_at !== undefined) update.posted_at = posted_at || null;

    const { data, error } = await supabase
      .from("posts")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (err) {
    console.error("Log-post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
