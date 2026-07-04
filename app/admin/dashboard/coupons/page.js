"use client";

import React, { useState, useEffect } from "react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");

  // Delete Confirm State
  const [confirmDeleteCode, setConfirmDeleteCode] = useState(null);

  // Form States
  const [code, setCode] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [discountAmt, setDiscountAmt] = useState("");
  const [minOrderVal, setMinOrderVal] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
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

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      triggerFeedback("error", "Please enter a coupon code");
      return;
    }

    const payload = {
      code: code.toUpperCase(),
      discountPct: discountPct ? parseInt(discountPct) : null,
      discountAmt: discountAmt ? parseInt(discountAmt) : null,
      minOrderVal: minOrderVal ? parseInt(minOrderVal) : 0,
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCode("");
        setDiscountPct("");
        setDiscountAmt("");
        setMinOrderVal("");
        triggerFeedback("success", "Coupon code created!");
        loadCoupons();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to create coupon");
      }
    } catch (err) {
      triggerFeedback("error", "An error occurred creating coupon");
    }
  };

  const handleDeleteCoupon = async (couponCode) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      if (res.ok) {
        triggerFeedback("success", `Coupon ${couponCode} deleted`);
        setConfirmDeleteCode(null);
        loadCoupons();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to delete coupon");
      }
    } catch (err) {
      triggerFeedback("error", "An error occurred deleting coupon");
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0 }}>🎁 Discount Coupon Controls</h2>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Configure store promo codes and order thresholds</p>
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
        {/* Create Coupon Card Form */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155", height: "fit-content" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            ➕ Create Promo Code
          </h3>
          <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>COUPON CODE *</label>
              <input
                className="inp"
                placeholder="e.g. NAVVY20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>DISCOUNT (%)</label>
                <input
                  className="inp"
                  type="number"
                  placeholder="e.g. 20"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>DISCOUNT (FLAT ₹)</label>
                <input
                  className="inp"
                  type="number"
                  placeholder="e.g. 200"
                  value={discountAmt}
                  onChange={(e) => setDiscountAmt(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>MINIMUM ORDER VALUE (₹)</label>
              <input
                className="inp"
                type="number"
                placeholder="e.g. 999"
                value={minOrderVal}
                onChange={(e) => setMinOrderVal(e.target.value)}
                style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
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
              Create Promo Code
            </button>
          </form>
        </div>

        {/* Coupons List panel */}
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "18px", margin: 0 }}>
            🎟️ Active Coupons
          </h3>

          {loading ? (
            <div style={{ color: "#94A3B8", fontSize: "13px" }}>Loading coupons list...</div>
          ) : coupons.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px" }}>
              No coupons created yet!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  style={{
                    background: "#0F172A",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    border: "1px solid #334155",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--coral)" }}>
                      {coupon.code}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                      {coupon.discountPct ? `Save ${coupon.discountPct}%` : `Save Flat ₹${coupon.discountAmt}`} · Min: ₹{coupon.minOrderVal}
                    </div>
                  </div>

                  {confirmDeleteCode === coupon.code ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteCode(null)}
                        style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteCode(coupon.code)}
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
