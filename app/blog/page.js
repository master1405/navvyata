import React from "react";
import Link from "next/link";
import prisma from "@/app/lib/prisma";

export const revalidate = 300; // Cache blog pages for up to 5 minutes

export default async function BlogListPage() {
  let posts = [];
  try {
    posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Database fetch failed on Blog page:", err);
  }

  return (
    <div id="s-blog" className="section page-body">
      <div className="sec-head" style={{ textAlign: "left" }}>
        <div>
          <div className="sec-title">Blog</div>
          <div className="sec-sub">Style guides, sizing tips and parenting ideas</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>No blog posts found.</div>
      ) : (
        <div className="blog-list">
          {posts.map((post, idx) => (
            <Link
              href={`/blog/${post.id}`}
              key={post.id}
              className={`bcard ${idx === 0 ? "featured" : ""}`}
              style={{ display: "block" }}
            >
              <div
                className="bcard-img"
                style={{
                  background:
                    idx === 0
                      ? "linear-gradient(135deg, var(--coral-l), var(--sun-l))"
                      : idx === 1
                      ? "var(--teal-l)"
                      : "var(--purple-l)",
                  height: idx === 0 ? "260px" : "180px",
                  fontSize: idx === 0 ? "72px" : "56px",
                }}
              >
                {post.emoji}
              </div>
              <div className="bcard-body">
                <div className="bcard-tag">{post.tag}</div>
                <div className="bcard-title">{post.title}</div>
                <div className="bcard-meta">{post.readTime}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
