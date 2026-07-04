"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function ConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, showToast } = useCart();

  const [orderId, setOrderId] = useState("");
  const [method, setMethod] = useState("UPI");
  const [optIn, setOptIn] = useState(true);

  useEffect(() => {
    const id = searchParams.get("orderId");
    const payMethod = searchParams.get("method") || "UPI";
    
    if (!id) {
      router.push("/");
      return;
    }
    setOrderId(id);
    setMethod(payMethod);
  }, [searchParams]);

  const getEstDeliveryString = () => {
    const d3 = new Date();
    d3.setDate(d3.getDate() + 3);
    const d5 = new Date();
    d5.setDate(d5.getDate() + 5);

    const f3 = d3.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const f5 = d5.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
    return `${f3} – ${f5}`;
  };

  const handleWhatsAppOptIn = () => {
    setOptIn(!optIn);
    showToast(optIn ? "📴 WhatsApp updates disabled" : "🟢 WhatsApp updates enabled!");
  };

  return (
    <div className="page active" id="s-confirm">
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 18px 80px", textAlign: "center" }} className="page-body">
        <div style={{ background: "linear-gradient(135deg, var(--green-l), var(--teal-l))", borderRadius: "var(--radius-lg)", padding: "28px 20px", marginBottom: "20px" }}>
          <div style={{ fontSize: "52px", marginBottom: "10px" }}>🎉</div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--ink)", marginBottom: "6px" }}>Order confirmed!</div>
          <div style={{ fontSize: "13px", color: "var(--ink2)" }}>Woohoo! Your little one is going to love this 🌟</div>
        </div>

        <div className="card" style={{ padding: "18px", textAlign: "left", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Order ID</div>
              <div style={{ fontSize: "15px", fontWeight: "800" }}>#{orderId}</div>
            </div>
            <span className="pill p-g">Confirmed ✓</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>Estimated delivery</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--teal-d)" }}>{getEstDeliveryString()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>Payment Method</div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", fontWeight: "bold" }}>{method}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>Delivering to</div>
            <div style={{ fontSize: "13px", color: "var(--ink2)" }}>
              {user?.addresses && user.addresses.length > 0 ? user.addresses[0].name : "Nagpur"}
            </div>
          </div>
        </div>

        <div
          onClick={handleWhatsAppOptIn}
          style={{
            background: "#E7FAE9",
            border: "1.5px solid #25D366",
            borderRadius: "var(--radius)",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "28px" }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#16A34A" }}>Get live updates on WhatsApp</div>
            <div style={{ fontSize: "11px", color: "#16A34A", opacity: 0.85 }}>Track order dispatch, transit, and delivery</div>
          </div>
          <input
            type="checkbox"
            checked={optIn}
            onChange={() => {}}
            style={{ accentColor: "#25D366", transform: "scale(1.2)", cursor: "pointer" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/account" style={{ flex: 1 }}>
            <button className="btn btn-outline" style={{ width: "100%", padding: "12px" }}>
              Track order 📦
            </button>
          </Link>
          <Link href="/shop" style={{ flex: 1 }}>
            <button className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              Continue shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
