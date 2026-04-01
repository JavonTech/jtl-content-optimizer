"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";

interface FormState {
  likes: string;
  comments: string;
  shares: string;
  clicks: string;
  impressions: string;
  kajabi_revenue: string;
  posted_at: string;
}

const EMPTY_FORM: FormState = {
  likes: "0",
  comments: "0",
  shares: "0",
  clicks: "0",
  impressions: "0",
  kajabi_revenue: "0",
  posted_at: "",
};

export default function LogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  function selectPost(post: Post) {
    setSelectedId(post.id);
    setSuccess("");
    setError("");
    setForm({
      likes: String(post.likes),
      comments: String(post.comments),
      shares: String(post.shares),
      clicks: String(post.clicks),
      impressions: String(post.impressions),
      kajabi_revenue: String(post.kajabi_revenue),
      posted_at: post.posted_at || "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/log-post", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, ...form }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setSuccess("Engagement logged successfully!");
      // Update local state
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedId ? { ...p, ...data.post } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  const selectedPost = posts.find((p) => p.id === selectedId);

  return (
    <div>
      <div className="page-header">
        <h2>Log Engagement</h2>
        <p>Select a post and record its performance metrics after publishing.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Post selector */}
        <div className="card">
          <div style={{ marginBottom: 14, fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Select Post ({posts.length})
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <span className="spinner" style={{ borderTopColor: "var(--accent)" }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="icon">✦</div>
              <h3>No posts yet</h3>
              <p>Generate your first post on the Create page.</p>
            </div>
          ) : (
            <div className="post-select-list">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`post-select-item${selectedId === post.id ? " selected" : ""}`}
                  onClick={() => selectPost(post)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span className="platform">{post.platform}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="preview">{post.generated_text}</div>
                  <div style={{ marginTop: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {post.posted_at ? (
                      <span style={{ color: "var(--success)" }}>Posted {post.posted_at}</span>
                    ) : (
                      <span>Draft — not posted</span>
                    )}
                    {" · "}
                    {post.impressions > 0 ? `${post.impressions.toLocaleString()} impressions` : "No metrics yet"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engagement form */}
        <div className="card">
          {!selectedPost ? (
            <div className="empty-state">
              <div className="icon">◈</div>
              <h3>No post selected</h3>
              <p>Choose a post from the list to log its engagement.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="form-grid">
              <div style={{
                padding: "10px 14px",
                background: "var(--bg-input)",
                borderRadius: "var(--radius-sm)",
                marginBottom: 4,
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span className="badge badge-platform">{selectedPost.platform}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedPost.content_type}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedPost.generated_text}
                </p>
              </div>

              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Posted At</label>
                <input type="date" {...field("posted_at")} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Impressions</label>
                  <input type="number" min="0" {...field("impressions")} />
                </div>
                <div className="form-group">
                  <label>Likes</label>
                  <input type="number" min="0" {...field("likes")} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Comments</label>
                  <input type="number" min="0" {...field("comments")} />
                </div>
                <div className="form-group">
                  <label>Shares</label>
                  <input type="number" min="0" {...field("shares")} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Clicks</label>
                  <input type="number" min="0" {...field("clicks")} />
                </div>
                <div className="form-group">
                  <label>Kajabi Revenue ($)</label>
                  <input type="number" min="0" step="0.01" {...field("kajabi_revenue")} />
                </div>
              </div>

              {/* Computed preview */}
              {Number(form.impressions) > 0 && (
                <div style={{
                  padding: "10px 14px",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                }}>
                  Engagement rate:{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    {(
                      ((Number(form.likes) + Number(form.comments) + Number(form.shares) + Number(form.clicks)) /
                        Number(form.impressions)) *
                      100
                    ).toFixed(2)}%
                  </strong>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success btn-full"
                disabled={saving}
              >
                {saving ? <><span className="spinner" /> Saving...</> : "◈ Save Engagement"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
