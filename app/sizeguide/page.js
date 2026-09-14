"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SIZE_CHART, getRecommendedSize } from "@/app/lib/constants";

/**
 * Interactive Children's Apparel Sizing Guide
 * Features:
 * - Category-segmented charts (Baby, Toddler, Kids, Tweens) spanning 0M to 14Y
 * - Interactive Fit Calculator that dynamically highlights the matching row without hardcoded defaults
 * - Measurement guidance for parents
 */

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "baby" | "toddler" | "kids" | "tweens"
  const [calcAge, setCalcAge] = useState("");
  const [calcHeight, setCalcHeight] = useState("");
  const [highlightedSize, setHighlightedSize] = useState(null);

  const filteredSizes = activeTab === "all"
    ? SIZE_CHART
    : SIZE_CHART.filter((item) => item.category === activeTab);

  const handleCalculateFit = (e) => {
    e.preventDefault();
    if (!calcAge && !calcHeight) return;

    const rec = getRecommendedSize(calcAge, calcHeight);
    setHighlightedSize(rec);

    // Auto-switch to the category containing the recommended size
    const foundItem = SIZE_CHART.find((s) => s.size === rec);
    if (foundItem && activeTab !== "all" && foundItem.category !== activeTab) {
      setActiveTab("all");
    }
  };

  const handleClearFit = () => {
    setCalcAge("");
    setCalcHeight("");
    setHighlightedSize(null);
  };

  return (
    <div id="s-sizeguide">
      <div className="section page-body" style={{ maxWidth: "840px", textAlign: "left" }}>
        
        {/* Breadcrumbs & Title */}
        <div className="breadcrumb" style={{ marginBottom: "12px" }}>
          <Link href="/">Home</Link> / Size guide
        </div>
        <div className="sec-title" style={{ fontSize: "28px", marginBottom: "6px" }}>
          Children's Size Guide
        </div>
        <p style={{ fontSize: "14px", color: "var(--ink2)", marginBottom: "24px", lineHeight: "1.6" }}>
          Navvyata fits are designed with extra comfort and play durability. Use this guide to find the perfect fit.
          When between measurements, we recommend sizing up to allow room for natural growth.
        </p>

        {/* Interactive Fit Calculator Card */}
        <div style={{ background: "linear-gradient(135deg, var(--teal-l), #e6fffa)", border: "1.5px solid var(--teal)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--teal-d)" }}>
                📏 Interactive Fit Finder
              </div>
              <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "2px" }}>
                Enter your child's age or height to highlight their recommended size below
              </div>
            </div>
            {highlightedSize && (
              <button
                onClick={handleClearFit}
                style={{ background: "none", border: "none", fontSize: "12px", color: "var(--coral-d)", cursor: "pointer", fontWeight: "700" }}
              >
                Clear filter ×
              </button>
            )}
          </div>

          <form onSubmit={handleCalculateFit} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px" }}>
              <input
                className="inp"
                placeholder="Age (0–14 yrs)"
                type="number"
                min="0"
                max="14"
                step="0.5"
                value={calcAge}
                onChange={(e) => setCalcAge(e.target.value)}
                style={{ background: "#fff" }}
              />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <input
                className="inp"
                placeholder="Height in cm"
                type="number"
                min="40"
                max="180"
                value={calcHeight}
                onChange={(e) => setCalcHeight(e.target.value)}
                style={{ background: "#fff" }}
              />
            </div>
            <button className="btn btn-primary btn-sm" type="submit" style={{ padding: "11px 20px" }}>
              Find Best Fit →
            </button>
          </form>

          {highlightedSize && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#fff", borderRadius: "var(--radius-sm)", border: "1px solid var(--teal)", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🎯</span>
              <span style={{ fontSize: "13px", color: "var(--teal-d)", fontWeight: "600" }}>
                Recommended size: <strong>{highlightedSize}</strong> (Highlighted in chart below)
              </span>
            </div>
          )}
        </div>

        {/* Category Segment Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "all", label: "All Sizes (0–14Y)" },
            { id: "baby", label: "Baby (0–12M)" },
            { id: "toddler", label: "Toddler (1–4Y)" },
            { id: "kids", label: "Kids (4–10Y)" },
            { id: "tweens", label: "Tweens (10–14Y)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`chip ${activeTab === tab.id ? "on" : ""}`}
              style={{ padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sizing Measurement Table */}
        <div style={{ overflowX: "auto", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "28px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "540px" }}>
            <thead>
              <tr style={{ background: "var(--coral)", color: "#fff" }}>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Size</th>
                <th style={{ padding: "14px", textAlign: "center" }}>Age Bracket</th>
                <th style={{ padding: "14px", textAlign: "center" }}>Height (cm)</th>
                <th style={{ padding: "14px", textAlign: "center" }}>Chest (cm)</th>
                <th style={{ padding: "14px", textAlign: "center" }}>Waist (cm)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSizes.map((row, idx) => {
                const isSelected = highlightedSize === row.size;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={row.size}
                    style={{
                      background: isSelected
                        ? "var(--coral-l)"
                        : isEven
                        ? "var(--bg)"
                        : "#fff",
                      outline: isSelected ? "2px solid var(--coral)" : "none",
                      outlineOffset: "-2px",
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setHighlightedSize(isSelected ? null : row.size)}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: "800", color: isSelected ? "var(--coral-d)" : "var(--coral)" }}>
                      {row.size} {isSelected && "🎯"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>{row.age}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>{row.heightMin}–{row.heightMax}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>{row.chest}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "var(--ink2)" }}>{row.waist}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* How to Measure Guidelines */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "28px" }}>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--ink)", marginBottom: "12px" }}>
            💡 How to measure your child
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "13px", color: "var(--ink2)", lineHeight: "1.6" }}>
            <div>
              <strong style={{ color: "var(--ink)" }}>1. Height</strong>
              <div>Measure without shoes, standing barefoot with feet flat against a wall from crown of head to heel.</div>
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>2. Chest</strong>
              <div>Measure horizontally around the fullest part of the chest, keeping tape comfortably level under armpits.</div>
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>3. Waist</strong>
              <div>Measure around the natural waistline (just above belly button), keeping one finger between tape and body.</div>
            </div>
          </div>
        </div>

        {/* CTA to Shop */}
        <div style={{ textAlign: "center" }}>
          <Link href="/shop">
            <button className="btn btn-primary" style={{ padding: "12px 32px", fontSize: "14px" }}>
              Explore Kids Collection →
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
