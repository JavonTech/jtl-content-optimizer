"use client";

import { useState } from "react";

function parseInsights(text: string) {
  // Split on markdown headings for nicer rendering
  return text;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastRun, setLastRun] = useState<Date | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setInsights(null);

    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setInsights(data.insights);
      setLastRun(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function renderInsights(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ") || line.startsWith("### ")) {
        const content = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
        return (
          <h3 key={i} style={{ color: "var(--accent)", fontSize: "1rem", margin: "24px 0 8px", fontWeight: 700 }}>
            {content}
          </h3>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} style={{ fontWeight: 700, color: "var(--text-primary)", margin: "12px 0 4px" }}>
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <p key={i} style={{ margin: "4px 0", paddingLeft: 16, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {line.replace(/^[-•]\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1")}
          </p>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <p key={i} style={{ margin: "6px 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <strong style={{ color: "var(--accent)" }}>{line.match(/^\d+\./)?.[0]}</strong>{" "}
            {line.replace(/^\d+\.\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1")}
          </p>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} style={{ margin: "6px 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          {line.replace(/\*\*(.+?)\*\*/g, "$1")}
        </p>
      );
    });
  }

  return (
    <div>
      <div className="page-header">
        <h2>AI Insights</h2>
        <p>Claude analyzes all your post data and surfaces optimization recommendations.</p>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        {/* Trigger card */}
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Run Optimization Analysis
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {lastRun
                ? `Last run: ${lastRun.toLocaleTimeString()} — ${lastRun.toLocaleDateString()}`
                : "Analyzes all posts, identifies patterns, and recommends next steps."}
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ minWidth: 200 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              "◉ Analyze Posts"
            )}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ marginBottom: 16 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--accent)" }} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Claude is reviewing your posts and building recommendations...
            </p>
          </div>
        )}

        {insights && !loading && (
          <div className="card">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge badge-success">AI Analysis Complete</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Powered by Claude claude-opus-4-6
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(parseInsights(insights));
                }}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              >
                Copy
              </button>
            </div>

            <div style={{ lineHeight: 1.8 }}>
              {renderInsights(insights)}
            </div>
          </div>
        )}

        {!insights && !loading && !error && (
          <div className="empty-state">
            <div className="icon">◉</div>
            <h3>No analysis yet</h3>
            <p>Hit &quot;Analyze Posts&quot; to get Claude&apos;s take on your content strategy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
