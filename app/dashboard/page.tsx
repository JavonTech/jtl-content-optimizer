"use client";

import { useEffect, useState } from "react";
import type { PostWithMetrics } from "@/lib/types";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="badge badge-gold">🥇 #1</span>;
  if (rank === 2) return <span className="badge badge-silver">🥈 #2</span>;
  if (rank === 3) return <span className="badge badge-bronze">🥉 #3</span>;
  return null;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  const loggedPosts = posts.filter((p) => p.posted_at);

  const totalEngagements = loggedPosts.reduce((s, p) => s + p.engagement_total, 0);
  const avgEngRate =
    loggedPosts.length > 0
      ? loggedPosts.reduce((s, p) => s + p.engagement_rate, 0) / loggedPosts.length
      : 0;
  const totalRevenue = posts.reduce((s, p) => s + Number(p.kajabi_revenue), 0);

  // Top 3 by engagement_rate (among logged posts)
  const ranked = [...loggedPosts]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 3);
  const topIds = new Set(ranked.map((p) => p.id));
  const rankMap = new Map(ranked.map((p, i) => [p.id, i + 1]));

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Performance overview across all published posts.</p>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Posts</div>
          <div className="summary-value">{posts.length}</div>
          <div className="summary-sub">{loggedPosts.length} with engagement data</div>
        </div>

        <div className="summary-card success">
          <div className="summary-label">Total Engagements</div>
          <div className="summary-value">{formatNumber(totalEngagements)}</div>
          <div className="summary-sub">likes + comments + shares + clicks</div>
        </div>

        <div className="summary-card warning">
          <div className="summary-label">Avg Engagement Rate</div>
          <div className="summary-value">{avgEngRate.toFixed(2)}%</div>
          <div className="summary-sub">across logged posts</div>
        </div>

        <div className="summary-card danger">
          <div className="summary-label">Kajabi Revenue</div>
          <div className="summary-value">${totalRevenue.toFixed(2)}</div>
          <div className="summary-sub">attributed to posts</div>
        </div>
      </div>

      {/* Posts table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <span className="spinner" style={{ width: 28, height: 28, borderTopColor: "var(--accent)" }} />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">▦</div>
          <h3>No posts yet</h3>
          <p>Generate and log posts to see your dashboard.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Platform</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Posted</th>
                <th>Impressions</th>
                <th>Engagements</th>
                <th>Eng. Rate</th>
                <th>Revenue</th>
                <th>Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    {topIds.has(post.id) ? (
                      <RankBadge rank={rankMap.get(post.id)!} />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-platform">{post.platform}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    {post.content_type}
                  </td>
                  <td>
                    <span className="truncate" style={{ display: "block" }} title={post.topic}>
                      {post.topic}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                    {post.posted_at || <span style={{ color: "var(--text-muted)" }}>Draft</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(post.impressions)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(post.engagement_total)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      style={{
                        color:
                          post.engagement_rate >= 5
                            ? "var(--success)"
                            : post.engagement_rate >= 2
                            ? "var(--warning)"
                            : "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {post.engagement_rate.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: post.kajabi_revenue > 0 ? "var(--success)" : "var(--text-muted)" }}>
                    ${Number(post.kajabi_revenue).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { label: "♥", value: post.likes },
                        { label: "💬", value: post.comments },
                        { label: "↗", value: post.shares },
                        { label: "↪", value: post.clicks },
                      ].map(({ label, value }) => (
                        <span key={label} className="metric-chip">
                          {label} <strong>{value}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
