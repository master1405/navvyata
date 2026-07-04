import React from "react";
import Link from "next/link";

export default function SizeGuidePage() {
  return (
    <div id="s-sizeguide">
      <div className="section page-body" style={{ maxWidth: "700px", textAlign: "left" }}>
        <div className="sec-title" style={{ marginBottom: "8px" }}>
          Size guide
        </div>
        <p style={{ fontSize: "13px", color: "var(--ink3)", marginBottom: "24px" }}>
          Measure chest and height. When between sizes, always go up.
        </p>
        <div style={{ overflow: "hidden", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--coral)", color: "#fff" }}>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Size</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Age</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Height (cm)</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Chest (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "var(--bg)" }}>
                <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--coral)" }}>3–4Y</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>3–4 yrs</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>96–104</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>53–56</td>
              </tr>
              <tr style={{ background: "#fff", outline: "2px solid var(--coral)", outlineOffset: "-1px" }}>
                <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--coral)" }}>4–5Y ✓</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>4–5 yrs</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>104–110</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>56–59</td>
              </tr>
              <tr style={{ background: "var(--bg)" }}>
                <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--coral)" }}>5–6Y</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>5–6 yrs</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>110–116</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>59–62</td>
              </tr>
              <tr style={{ background: "#fff" }}>
                <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--coral)" }}>6–7Y</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>6–7 yrs</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>116–122</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>62–65</td>
              </tr>
              <tr style={{ background: "var(--bg)" }}>
                <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--coral)" }}>7–8Y</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>7–8 yrs</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>122–128</td>
                <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>65–68</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link href="/shop">
          <button className="btn btn-primary" style={{ marginTop: "24px" }}>
            Got it ✓
          </button>
        </Link>
      </div>
    </div>
  );
}
