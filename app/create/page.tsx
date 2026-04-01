"use client";

import { useState } from "react";
import type { Platform, Post } from "@/lib/types";

const PLATFORMS: Platform[] = ["LinkedIn", "Instagram", "X", "Facebook"];

const CONTENT_TYPES = [
  "Educational Post",
  "Thought Leadership",
  "Personal Story",
  "Controversial Take",
  "List / Tips",
  "Behind the Scenes",
  "Promotional",
  "Case Study",
  "Poll / Question",
];

const CTA_GOALS = [
  "Drive course signups",
  "Grow email list",
  "Boost profile follows",
  "Increase webinar registrations",
  "Drive consultation bookings",
  "Generate comments",
  "Increase shares",
  "Build brand awareness",
];

export default function CreatePage() {
  const [platform, setPlatform] = useState<Platform>("LinkedIn");
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [topic, setTopic] = useState("");
  const [ctaGoal, setCtaGoal] = useState(CTA_GOALS[0]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) { setError("Topic is required."); return; }
    setError("");
    setLoading(true);
    setPost(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          content_type: contentType,
          topic: topic.trim(),
          cta_goal: ctaGoal,
          context: context.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!post) return;
    await navigator.clipboard.writeText(post.generated_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Generate Post</h2>
        <p>AI-powered social content built around Javon Technology&apos;s brand voice.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: post ? "1fr 1fr" : "1fr", gap: 24 }}>
        <div className="card">
          <form onSubmit={handleGenerate} className="form-grid">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why AI will kill traditional PM certifications"
                required
              />
            </div>

            <div className="form-group">
              <label>CTA Goal</label>
              <select value={ctaGoal} onChange={(e) => setCtaGoal(e.target.value)}>
                {CTA_GOALS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Additional Context <span style={{ color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any specific angles, stats, or stories to include..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating...
                </>
              ) : (
                "✦ Generate Post"
              )}
            </button>
          </form>
        </div>

        {post && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="badge badge-platform">{post.platform}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{post.content_type}</span>
              </div>
              <span className="badge badge-success">Saved to DB</span>
            </div>

            <div className="generated-post">
              {post.generated_text}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ flex: 1 }}>
                {copied ? "✓ Copied!" : "Copy Text"}
              </button>
              <button
                onClick={() => { setPost(null); setTopic(""); setContext(""); }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                New Post
              </button>
            </div>

            <div style={{
              padding: "10px 14px",
              background: "var(--bg-input)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}>
              Post ID: <code style={{ color: "var(--text-secondary)" }}>{post.id.slice(0, 8)}...</code>
              {" "}— Head to <strong style={{ color: "var(--accent)" }}>Log</strong> to record engagement after posting.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
