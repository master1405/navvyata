"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMetrics(data.metrics);
          }
        }
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return <div style={{ color: "#94A3B8" }}>Loading dashboard metrics...</div>;
  }

  if (!metrics) {
    return <div style={{ color: "#F87171" }}>Failed to load dashboard data.</div>;
  }

  return (
    <div style={{ textAlign: "left" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0 }}>📊 Performance Dashboard</h2>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Real-time overview of your e-commerce platform</p>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--teal)", marginTop: "8px" }}>₹{metrics.totalSales.toLocaleString()}</div>
        </div>

        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Orders</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--coral)", marginTop: "8px" }}>{metrics.totalOrders}</div>
        </div>

        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Avg Order Value</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--sun)", marginTop: "8px" }}>₹{metrics.avgOrderValue.toLocaleString()}</div>
        </div>

        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Total Customers</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#F8FAFC", marginTop: "8px" }}>{metrics.totalCustomers}</div>
        </div>
      </div>

      {/* Warnings / Alerts Panel */}
      <div style={{ background: "#1E293B", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", margin: 0 }}>⚠️ Inventory low-stock alerts</h3>
          <span className="pill p-c" style={{ fontSize: "10px", padding: "4px 8px" }}>Critical</span>
        </div>

        {metrics.lowStockAlerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#94A3B8", fontSize: "13px" }}>
            🟢 All sizes and items are fully stocked!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #334155" }}>
                  <th style={{ padding: "10px", color: "#94A3B8" }}>Product</th>
                  <th style={{ padding: "10px", color: "#94A3B8" }}>Size</th>
                  <th style={{ padding: "10px", color: "#94A3B8" }}>Current Stock</th>
                  <th style={{ padding: "10px", color: "#94A3B8", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStockAlerts.map((ls) => (
                  <tr key={ls.id} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: "#fff" }}>
                      <span style={{ marginRight: "6px" }}>{ls.emoji}</span>
                      {ls.productName}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#E2E8F0" }}>{ls.size}</td>
                    <td style={{ padding: "12px 10px", color: "#F87171", fontWeight: "bold" }}>{ls.stock} units</td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>
                      <span
                        style={{
                          background: ls.stock === 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: ls.stock === 0 ? "#EF4444" : "#F59E0B",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {ls.stock === 0 ? "Out of Stock" : "Low Inventory"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
