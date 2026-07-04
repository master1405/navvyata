"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already authenticated
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/auth/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.admin) {
            router.push("/admin/dashboard");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1E293B",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          border: "1px solid #334155",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--coral)", letterSpacing: "-.5px" }}>
            navvyata
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Admin Console Portal
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              fontSize: "13px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              marginBottom: "18px",
              textAlign: "left",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. owner@navvyata.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: "#0F172A",
                border: "1.5px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                padding: "12px 14px",
                fontSize: "13px",
                outline: "none",
                transition: "border-color .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--coral)")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: "#0F172A",
                border: "1.5px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                padding: "12px 14px",
                fontSize: "13px",
                outline: "none",
                transition: "border-color .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--coral)")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--coral)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              marginTop: "8px",
              transition: "opacity .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)}
            onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "11px", color: "#64748B" }}>
          🔒 Secure administrative system access
        </div>
      </div>
    </div>
  );
}
