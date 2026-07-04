import React from "react";
import Link from "next/link";
import prisma from "@/app/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import FirstTimerBanner from "@/app/components/FirstTimerBanner";
import NewsletterForm from "@/app/components/NewsletterForm";

export const revalidate = 60; // Revalidate home page cache every minute

export default async function Home() {
  // Server-side queries
  let bestsellers = [];
  let blogs = [];
  try {
    bestsellers = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 6,
      include: { sizes: true },
    });
    blogs = await prisma.blogPost.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Database fetch failed on Home page:", err);
  }

  return (
    <div id="s-home">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-inner">
          <div>
            <span style={{ display: "inline-block", background: "#fff", color: "var(--coral-d)", fontSize: "12px", fontWeight: "700", padding: "7px 16px", borderRadius: "50px", marginBottom: "18px" }}>
              ✨ Summer '25 Collection is here
            </span>
            <h1 className="hero-title">
              Clothes that let<br />kids be <em>kids</em>
            </h1>
            <p className="hero-sub">
              Fun, comfy and durable styles for every adventure — from newborns to tweens. Ages 0–14 yrs, designed for play.
            </p>
            <div className="hero-ctas">
              <Link href="/shop">
                <button className="btn btn-primary">Shop now →</button>
              </Link>
              <Link href="/shop?filter=sale">
                <button className="btn btn-outline">Sale 🔥</button>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <Link href="/shop" className="hero-card">
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>👕</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink2)" }}>Graphic Tees</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--coral)", marginTop: "2px" }}>From ₹399</div>
            </Link>
            <Link href="/shop" className="hero-card">
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>👗</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink2)" }}>Summer Dresses</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--coral)", marginTop: "2px" }}>From ₹699</div>
            </Link>
            <Link href="/shop" className="hero-card">
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>🚀</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink2)" }}>Play Sets</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--coral)", marginTop: "2px" }}>From ₹899</div>
            </Link>
            <Link href="/shop" className="hero-card">
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>👟</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink2)" }}>Sneakers</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--coral)", marginTop: "2px" }}>From ₹999</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="trust-strip">
        <div className="trust-inner">
          <div className="trust-item">
            <span className="ti">🚚</span>
            <div>
              <div className="tt">Free shipping</div>
              <div className="td">On orders above ₹999</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="ti">♻️</span>
            <div>
              <div className="tt">Easy 30-day returns</div>
              <div className="td">No questions asked</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="ti">🌿</span>
            <div>
              <div className="tt">Skin-safe fabrics</div>
              <div className="td">100% OEKO-TEX certified</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="ti">⭐</span>
            <div>
              <div className="tt">50,000+ parents</div>
              <div className="td">4.8★ average rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* First Timer Coupon Claim Banner */}
      <FirstTimerBanner />

      {/* Shop by Age Grid */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="sec-head">
          <div style={{ textAlign: "left" }}>
            <div className="sec-title">Shop by age</div>
            <div className="sec-sub">Find the perfect fit for every stage</div>
          </div>
        </div>
        <div className="age-grid">
          <Link href="/shop?age=baby" className="age-card" style={{ background: "var(--coral-l)", color: "var(--coral-d)" }}>
            <div className="ai">🍼</div>
            <div className="al">Baby</div>
            <div className="ar">0–12m</div>
          </Link>
          <Link href="/shop?age=toddler" className="age-card" style={{ background: "var(--teal-l)", color: "var(--teal-d)" }}>
            <div className="ai">🐣</div>
            <div className="al">Toddler</div>
            <div className="ar">1–3y</div>
          </Link>
          <Link href="/shop?age=kids" className="age-card" style={{ background: "var(--sun-l)", color: "var(--sun-d)" }}>
            <div className="ai">🌈</div>
            <div className="al">Kids</div>
            <div className="ar">4–10y</div>
          </Link>
          <Link href="/shop?age=tweens" className="age-card" style={{ background: "var(--purple-l)", color: "var(--purple-d)" }}>
            <div className="ai">🎒</div>
            <div className="al">Tweens</div>
            <div className="ar">11–14y</div>
          </Link>
        </div>
      </div>

      {/* Bestsellers Grid */}
      <div className="section">
        <div className="sec-head">
          <div style={{ textAlign: "left" }}>
            <div className="sec-title">Bestsellers</div>
            <div className="sec-sub">What parents and kids are loving right now</div>
          </div>
          <Link href="/shop" className="sec-link">
            View all →
          </Link>
        </div>
        <div className="grid-4" id="home-grid">
          {bestsellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* Fabric Story trust builder */}
      <div style={{ background: "var(--ink)", padding: "40px 18px", marginBottom: 0 }}>
        <div style={{ maxWidth: "var(--maxw)", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: "var(--teal)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
              Why parents choose us
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-.3px" }}>
              Not just clothes. A promise.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", maxWidth: "700px", margin: "0 auto", textAlign: "left" }}>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "var(--radius)", padding: "18px", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🌿</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>OEKO-TEX certified</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,.6)", lineHeight: "1.6" }}>
                Tested for 100+ harmful substances. Safe even for newborns with sensitive skin.
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "var(--radius)", padding: "18px", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🎨</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>Colours that last</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,.6)", lineHeight: "1.6" }}>
                Reactive dyes that stay vibrant through 50+ washes. No fading, no bleeding.
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "var(--radius)", padding: "18px", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🧵</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>Built for play</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,.6)", lineHeight: "1.6" }}>
                Reinforced seams, stretchable fabric. Survives everything a 5-year-old throws at it.
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "var(--radius)", padding: "18px", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>♻️</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>Easy returns</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,.6)", lineHeight: "1.6" }}>
                30-day no-questions return. Wrong size? We'll exchange it. Free pickup from your door.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Parent Testimonials */}
      <div className="section" style={{ paddingTop: "48px" }}>
        <div className="sec-head">
          <div style={{ textAlign: "left" }}>
            <div className="sec-title">What parents are saying</div>
            <div className="sec-sub">Real reviews from real families across India</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", textAlign: "left" }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--coral-l)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "var(--coral-d)", flexShrink: 0 }}>SR</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>Sneha R.</div>
                <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Mom of 2 · Bangalore</div>
              </div>
              <div style={{ marginLeft: "auto", color: "var(--sun)", fontSize: "13px" }}>★★★★★</div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.75", marginBottom: "10px" }}>
              "My daughter has eczema and finding soft, non-irritating clothes is a nightmare. Navvyata's fabric is the only one she hasn't reacted to. We've ordered 6 times now and every piece is consistently good."
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "var(--teal-l)", color: "var(--teal-d)", fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "50px" }}>✓ Verified buyer</span>
              <span style={{ fontSize: "11px", color: "var(--ink3)" }}>Bought: Fox Print Romper</span>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--teal-l)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "var(--teal-d)", flexShrink: 0 }}>AM</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>Ankit M.</div>
                <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Dad · Mumbai</div>
              </div>
              <div style={{ marginLeft: "auto", color: "var(--sun)", fontSize: "13px" }}>★★★★★</div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.75", marginBottom: "10px" }}>
              "Was sceptical ordering from a new brand but the quality genuinely surprised me. The Lion Tee looked even better in person. My son wore it 3 days in a row and threw a fit when I tried to wash it 😂"
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "var(--teal-l)", color: "var(--teal-d)", fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "50px" }}>✓ Verified buyer</span>
              <span style={{ fontSize: "11px", color: "var(--ink3)" }}>Bought: Lion Safari Tee</span>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--purple-l)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "var(--purple-d)", flexShrink: 0 }}>PK</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>Preethi K.</div>
                <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Mom · Chennai</div>
              </div>
              <div style={{ marginLeft: "auto", color: "var(--sun)", fontSize: "13px" }}>★★★★★</div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.75", marginBottom: "10px" }}>
              "Delivery was in 2 days which I didn't expect! Packaging was so cute with a little note. The size ran exactly true to chart. Returning customer from now on — already gifted 3 sets to friends."
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "var(--teal-l)", color: "var(--teal-d)", fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "50px" }}>✓ Verified buyer</span>
              <span style={{ fontSize: "11px", color: "var(--ink3)" }}>Bought: Sparkle Jogger Set</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="promo-banner">
        <div className="promo-inner">
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.8)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
              Limited time
            </div>
            <div className="promo-title">Buy 3, Get 1 FREE</div>
            <Link href="/shop?filter=sale">
              <button className="btn" style={{ background: "#fff", color: "var(--coral)", padding: "11px 24px", fontSize: "13px" }}>
                Shop the offer →
              </button>
            </Link>
          </div>
          <div className="promo-emojis">👕👗🩳</div>
        </div>
      </div>

      {/* Blog Teaser */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div style={{ textAlign: "left" }}>
            <div className="sec-title">✍️ From our blog</div>
            <div className="sec-sub">Style guides, sizing tips and parenting ideas</div>
          </div>
          <Link href="/blog" className="sec-link">
            All articles →
          </Link>
        </div>
        <div className="blog-grid">
          {blogs.map((post, idx) => (
            <Link href={`/blog/${post.id}`} key={post.id} className={`bcard ${idx === 0 ? "featured" : ""}`}>
              <div className="bcard-img" style={{
                background: idx === 0 ? "linear-gradient(135deg,var(--coral-l),var(--sun-l))" : idx === 1 ? "var(--teal-l)" : "var(--purple-l)",
                height: idx === 0 ? "150px" : "120px",
                fontSize: "52px"
              }}>
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
      </div>

      {/* Newsletter signup */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: "48px" }}>
        <div className="newsletter">
          <div className="nl-title">Get 10% off your first order 🎁</div>
          <div className="nl-sub">Join 50,000+ parents. No spam, ever.</div>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
