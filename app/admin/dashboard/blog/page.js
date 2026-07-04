"use client";

import React, { useState, useEffect } from "react";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successFeedback, setSuccessFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Parenting");
  const [readTime, setReadTime] = useState("3 min read");
  const [emoji, setEmoji] = useState("✍️");
  const [content, setContent] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const triggerFeedback = (type, message) => {
    if (type === "success") {
      setSuccessFeedback(message);
      setErrorFeedback("");
      setTimeout(() => setSuccessFeedback(""), 3000);
    } else {
      setErrorFeedback(message);
      setSuccessFeedback("");
      setTimeout(() => setErrorFeedback(""), 4000);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      triggerFeedback("error", "Title and Content are required!");
      return;
    }

    const payload = {
      title,
      tag,
      readTime,
      emoji,
      content,
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setEmoji("✍️");
        setReadTime("3 min read");
        triggerFeedback("success", "Blog article published!");
        loadPosts();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to create post");
      }
    } catch (err) {
      triggerFeedback("error", "Error occurred saving post");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        triggerFeedback("success", "Blog post deleted");
        setConfirmDeleteId(null);
        loadPosts();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to delete post");
      }
    } catch (err) {
      triggerFeedback("error", "Error occurred deleting post");
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0 }}>✍️ Blog Articles Manager</h2>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Author and edit parenting tips and style guide articles</p>
      </div>

      {/* Feedback Alerts */}
      {successFeedback && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", color: "#34D399", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ✅ {successFeedback}
        </div>
      )}
      {errorFeedback && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#F87171", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ⚠️ {errorFeedback}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        {/* Author Post Form */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155", height: "fit-content" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            📝 Write New Article
          </h3>
          <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>TITLE *</label>
                <input
                  className="inp"
                  placeholder="e.g. 5 Tips for Kids Summer Outfits"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>EMOJI</label>
                <input
                  className="inp"
                  placeholder="e.g. 🌿"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", textAlign: "center" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>TAG</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                >
                  <option value="Parenting">Parenting</option>
                  <option value="Style Guide">Style Guide</option>
                  <option value="Sizing">Sizing Advice</option>
                  <option value="Eco Friendly">Eco Friendly</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>READ TIME</label>
                <input
                  className="inp"
                  placeholder="e.g. 4 min read"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>CONTENT TEXT *</label>
              <textarea
                className="inp"
                placeholder="Write your article text here (Markdown/Formatting is supported via lines breaks)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "12px", borderRadius: "6px", height: "180px", resize: "none" }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "var(--teal)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Publish Article
            </button>
          </form>
        </div>

        {/* Blog listings lists */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            📰 Published Articles
          </h3>

          {loading ? (
            <div style={{ color: "#94A3B8", fontSize: "13px" }}>Loading articles...</div>
          ) : posts.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px" }}>
              No articles published yet!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: "#0F172A",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    border: "1px solid #334155",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "28px" }}>{post.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                      {post.tag} · {post.readTime}
                    </div>
                  </div>

                  {confirmDeleteId === post.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(post.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      Delete 🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
