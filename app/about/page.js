import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div id="s-about">
      <div style={{ background: "linear-gradient(120deg,var(--coral),var(--teal))", padding: "60px 20px", textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-1px" }}>navvyata</div>
        <div style={{ fontSize: "14px", opacity: 0.85, marginTop: "6px" }}>newness for little ones</div>
      </div>
      <div className="section page-body" style={{ maxWidth: "700px", textAlign: "left" }}>
        <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "12px" }}>Our story</div>
        <p style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.8, marginBottom: "28px" }}>
          Navvyata was born from a simple belief — every child deserves clothes that are as joyful, free, and full of life as they are. We design every piece with care, using skin-safe fabrics and vibrant prints that spark imagination.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          <div style={{ background: "var(--coral-l)", borderRadius: "var(--radius)", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--coral)" }}>50K+</div>
            <div style={{ fontSize: "12px", color: "var(--coral-d)" }}>Happy families</div>
          </div>
          <div style={{ background: "var(--teal-l)", borderRadius: "var(--radius)", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--teal-d)" }}>100%</div>
            <div style={{ fontSize: "12px", color: "var(--teal-d)" }}>OEKO-TEX safe</div>
          </div>
          <div style={{ background: "var(--sun-l)", borderRadius: "var(--radius)", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--sun-d)" }}>2L+</div>
            <div style={{ fontSize: "12px", color: "var(--sun-d)" }}>Orders shipped</div>
          </div>
          <div style={{ background: "var(--green-l)", borderRadius: "var(--radius)", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--green-d)" }}>🌿</div>
            <div style={{ fontSize: "12px", color: "var(--green-d)" }}>Sustainable</div>
          </div>
        </div>
        <Link href="/shop">
          <button className="btn btn-primary">Shop the collection →</button>
        </Link>
      </div>
    </div>
  );
}
