import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import type { Post } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BRAND_CONTEXT = `
You are writing social media content for Javon Technology Ltd., a Canadian AI product management training company.

FOUNDER VOICE — John Nova:
- Contrarian PM educator: rejects traditional certifications, advocates AI-first product thinking
- Audience: aspiring PMs, career-switchers, tech professionals hungry for real-world strategy
- Tone: direct, confident, occasionally provocative — but always backed by substance
- Style: hooks that stop scrolls, insight delivered fast, CTAs that convert curiosity into action
- No fluff, no corporate speak, no recycled advice

CONTENT PRINCIPLES:
1. Open with a pattern-interrupt hook (controversial take, surprising stat, or bold claim)
2. Deliver one sharp, actionable insight
3. Close with a CTA that creates urgency without being salesy
4. Match platform norms (LinkedIn: narrative + insight; X: punchy + thread-worthy; Instagram: visual-first caption; Facebook: community-conversational)
`.trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, content_type, topic, cta_goal, context } = body;

    if (!platform || !content_type || !topic || !cta_goal) {
      return NextResponse.json(
        { error: "Missing required fields: platform, content_type, topic, cta_goal" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch top 3 performing posts as optimization signals
    const { data: topPosts } = await supabase
      .from("posts")
      .select("*")
      .not("impressions", "eq", 0)
      .order("impressions", { ascending: false })
      .limit(10);

    let topPerformers: Post[] = [];
    if (topPosts && topPosts.length > 0) {
      topPerformers = (topPosts as Post[])
        .map((p) => ({
          ...p,
          _engRate:
            p.impressions > 0
              ? ((p.likes + p.comments + p.shares + p.clicks) / p.impressions) * 100
              : 0,
        }))
        .sort((a, b) => b._engRate - a._engRate)
        .slice(0, 3);
    }

    const performerContext =
      topPerformers.length > 0
        ? `\nTOP PERFORMING POSTS (use these as style/signal references):\n` +
          topPerformers
            .map(
              (p, i) =>
                `${i + 1}. [${p.platform} | ${p.content_type}] Topic: "${p.topic}" — Engagement rate: ${
                  Math.round(((p.likes + p.comments + p.shares + p.clicks) / Math.max(p.impressions, 1)) * 100)
                }%\n   Post preview: ${p.generated_text.slice(0, 200)}...`
            )
            .join("\n\n")
        : "\n(No historical performance data yet — write a strong baseline post.)";

    const systemPrompt = `${BRAND_CONTEXT}\n${performerContext}`;

    const userPrompt = `Write a ${platform} post for Javon Technology Ltd.

Platform: ${platform}
Content Type: ${content_type}
Topic: ${topic}
CTA Goal: ${cta_goal}
${context ? `Additional Context: ${context}` : ""}

Output ONLY the post text — no preamble, no labels, no quotes. The post should be ready to publish.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const generated_text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Save draft to Supabase
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        platform,
        content_type,
        topic,
        cta_goal,
        generated_text,
        posted_at: null,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        impressions: 0,
        kajabi_revenue: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
