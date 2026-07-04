import React from "react";
import Link from "next/link";
import prisma from "@/app/lib/prisma";

export const revalidate = 300; // Cache individual posts for up to 5 minutes

export default async function BlogArticlePage({ params }) {
  // Resolve params
  const { id } = await params;

  let post = null;
  let shopItems = [];

  try {
    post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
    });

    if (post) {
      // Fetch some products to populate "Shop this look" widget
      shopItems = await prisma.product.findMany({
        take: 3,
      });
    }
  } catch (err) {
    console.error("Database fetch failed on Blog detail page:", err);
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Post not found</h2>
        <Link href="/blog" style={{ color: "var(--coral)", display: "inline-block", marginTop: "12px" }}>
          Back to blog list
        </Link>
      </div>
    );
  }

  return (
    <div id="s-blog-article">
      <div className="section page-body" style={{ maxWidth: "720px", textAlign: "left" }}>
        <span className="pill p-c" style={{ marginBottom: "14px" }}>
          {post.tag}
        </span>
        <h1 style={{ fontSize: "26px", fontWeight: "900", lineHeight: 1.2, marginBottom: "12px", color: "var(--ink)" }}>
          {post.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", color: "var(--ink3)", fontSize: "13px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#fff" }}>
            NT
          </div>
          Navvyata Team · {post.readTime} ·{" "}
          {new Date(post.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </div>

        {/* Article main emoji banner */}
        <div
          style={{
            height: "220px",
            background: "linear-gradient(135deg, var(--coral-l), var(--sun-l))",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "72px",
            marginBottom: "24px",
          }}
        >
          {post.emoji}
        </div>

        {/* Content */}
        <div style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.8, marginBottom: "20px", whiteSpace: "pre-line" }}>
          {post.content}
        </div>

        {/* Shop this look coordinate widget */}
        {shopItems.length > 0 && (
          <div style={{ background: "var(--coral-l)", borderRadius: "var(--radius)", padding: "16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--coral-d)", marginBottom: "12px" }}>
              🛍️ Shop this look
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {shopItems.map((item) => (
                <Link
                  href={`/product/${item.id}`}
                  key={item.id}
                  style={{ textAlign: "center", cursor: "pointer", display: "block" }}
                >
                  <div style={{ width: "72px", height: "72px", background: "#fff", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "6px" }}>
                    {item.emoji}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: "700" }}>{item.name.split(" ")[0]}</div>
                  <div style={{ fontSize: "12px", color: "var(--coral)", fontWeight: "800" }}>₹{item.price}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link href="/blog" style={{ color: "var(--coral)", fontSize: "13px", fontWeight: "700", display: "inline-block", marginTop: "10px" }}>
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
