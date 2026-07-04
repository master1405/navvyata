"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate admin auth profile on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.admin) {
            setAdmin(data.admin);
          } else {
            router.push("/admin");
          }
        } else {
          router.push("/admin");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/admin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F172A",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        Loading admin console session...
      </div>
    );
  }

  if (!admin) return null;

  const links = [
    { name: "📊 Overview", path: "/admin/dashboard" },
    { name: "👕 Products", path: "/admin/dashboard/products" },
    { name: "🎁 Coupons", path: "/admin/dashboard/coupons" },
    { name: "✍️ Blog Articles", path: "/admin/dashboard/blog" },
  ];

  // Add team link only if role is Owner
  if (admin.role === "Owner") {
    links.push({ name: "👥 Team RBAC", path: "/admin/dashboard/team" });
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0F172A",
        color: "#F8FAFC",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: "260px",
          background: "#1E293B",
          borderRight: "1px solid #334155",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div style={{ padding: "24px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--coral)", letterSpacing: "-.5px" }}>
            navvyata
          </div>
          <span style={{ fontSize: "10px", color: "var(--teal)", fontWeight: "bold", textTransform: "uppercase" }}>
            Admin Dashboard
          </span>
        </div>

        {/* Links */}
        <nav style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#fff" : "#94A3B8",
                  background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  textDecoration: "none",
                  transition: "background .15s, color .15s",
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin profile */}
        <div style={{ padding: "20px", borderTop: "1px solid #334155", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{admin.name}</div>
            <div style={{ fontSize: "11px", color: "var(--teal)" }}>
              🔑 {admin.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              textAlign: "center",
              width: "100%",
            }}
          >
            Logout 🚪
          </button>
        </div>
      </aside>

      {/* Main Panel Content wrapper */}
      <main style={{ flex: 1, padding: "36px 40px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
