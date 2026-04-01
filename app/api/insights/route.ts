export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import type { Post } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    const posts = data as Post[];

    if (posts.length === 0) {
      return NextResponse.json({
        insights:
          "No posts found yet. Create and log some posts to get AI-powered optimization insights.",
      });
    }

    const postsWithMetrics = posts.map((p) => {
      const engagement_total = p.likes + p.comments + p.shares + p.clicks;
      const engagement_rate =
        p.impressions > 0
          ? Math.round((engagement_total / p.impressions) * 10000) / 100
          : 0;
      return { ...p, engagement_total, engagement_rate };
    });

    const loggedPosts = postsWithMetrics.filter((p) => p.posted_at);
    const totalRevenue = postsWithMetrics.reduce((s, p) => s + Number(p.kajabi_revenue), 0);

    const postsSummary = postsWithMetrics
      .slice(0, 20)
      .map(
        (p, i) =>
          `Post ${i + 1}:
  Platform: ${p.platform}
  Type: ${p.content_type}
  Topic: ${p.topic}
  CTA Goal: ${p.cta_goal}
  Engagement Rate: ${p.engagement_rate}%
  Impressions: ${p.impressions} | Likes: ${p.likes} | Comments: ${p.comments} | Shares: ${p.shares} | Clicks: ${p.clicks}
  Kajabi Revenue: $${Number(p.kajabi_revenue).toFixed(2)}
  Posted: ${p.posted_at || "Not yet posted"}
  Content Preview: ${p.generated_text.slice(0, 300)}...`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are a senior social media strategist and growth consultant for Javon Technology Ltd., a Canadian AI PM training company. Analyze performance data and provide sharp, actionable optimization recommendations. Be specific, data-driven, and direct — no generic advice.`;

    const userPrompt = `Analyze these ${posts.length} social media posts for Javon Technology Ltd. and provide optimization recommendations.

OVERALL STATS:
- Total posts: ${posts.length}
- Posts with logged engagement: ${loggedPosts.length}
- Total Kajabi revenue attributed: $${totalRevenue.toFixed(2)}

POST DATA:
${postsSummary}

Provide a structured analysis covering:
1. **Top Performing Patterns** — What's working and why
2. **Underperforming Areas** — What to fix or avoid
3. **Platform-Specific Recommendations** — Tailored advice per platform
4. **Content Type Opportunities** — Which formats to double down on
5. **Revenue Optimization** — How to improve Kajabi conversion
6. **Next 5 Post Ideas** — Specific topics and angles based on what's performing

Be specific to the actual data. Reference real patterns from the posts.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const insights =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
