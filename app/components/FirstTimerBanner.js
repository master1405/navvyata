"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";

export default function FirstTimerBanner() {
  const [visible, setVisible] = useState(true);
  const { showToast } = useCart();

  const handleClaim = () => {
    showToast("🎁 Code NAVVY20 copied! Use at checkout.");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div id="ftb" style={{ background: "linear-gradient(90deg,var(--ink),#2D2D4E)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "22px", flexShrink: 0 }}>🎁</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>First order? Get 20% off</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,.65)" }}>Use code NAVVY20 · Valid for 24 hours</div>
        </div>
      </div>
      <button
        onClick={handleClaim}
        style={{
          background: "var(--sun)",
          color: "var(--ink)",
          border: "none",
          borderRadius: "50px",
          padding: "8px 16px",
          fontSize: "12px",
          fontWeight: "800",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Claim →
      </button>
    </div>
  );
}
