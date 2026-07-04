"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function RewardsPage() {
  const router = useRouter();
  const { user, showToast } = useCart();

  const handleRedeemClick = () => {
    if (!user) {
      showToast("👤 Please sign in to view and redeem rewards");
      router.push("/account?redirect=/cart");
    } else {
      showToast("🛒 Coins can be redeemed directly inside your cart summary!");
      router.push("/cart");
    }
  };

  const coinBalance = user?.coins || 0;

  return (
    <div id="s-rewards" className="section page-body">
      <div style={{ maxWidth: "580px", margin: "0 auto", textAlign: "left" }}>
        <div style={{ background: "linear-gradient(120deg, var(--coral), #FF8E53)", borderRadius: "var(--radius-lg)", padding: "36px", textAlign: "center", color: "#fff", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase", letterSpacing: ".5px" }}>Your balance</div>
          <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "4px" }}>🌟 {coinBalance}</div>
          <div style={{ opacity: 0.85, marginBottom: "18px" }}>coins = ₹{coinBalance * 0.1} off your next order</div>
          <button onClick={handleRedeemClick} style={{ background: "#fff", color: "var(--coral)", border: "none", borderRadius: "50px", padding: "11px 26px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
            Redeem →
          </button>
        </div>

        <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>How to earn coins</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--sun-l)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              🛍️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Make a purchase</div>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>1 coin per ₹10 spent</div>
            </div>
          </div>

          <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--teal-l)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              ⭐
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Write a review</div>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>50 coins per review</div>
            </div>
          </div>

          <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--purple-l)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              👥
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Refer a friend</div>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>200 coins per referral</div>
            </div>
            <button onClick={() => showToast("🔗 Referral link copied! Share with friends.")} className="btn btn-primary btn-sm">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
