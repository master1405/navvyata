"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";

export default function ShopClient({ initialProducts, filterParam, ageParam }) {
  const [products] = useState(initialProducts);

  // Filter States
  const [selectedAges, setSelectedAges] = useState({
    baby: ageParam === "baby",
    toddler: ageParam === "toddler",
    kids: ageParam === "kids",
    tweens: ageParam === "tweens",
  });

  const [selectedCategories, setSelectedCategories] = useState({
    tops: false,
    dresses: false,
    bottoms: false,
    sets: false,
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState("Featured");

  // Mobile Filter Sheet Overlay State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync state if query URL parameters change
  useEffect(() => {
    setSelectedAges({
      baby: ageParam === "baby",
      toddler: ageParam === "toddler",
      kids: ageParam === "kids",
      tweens: ageParam === "tweens",
    });
  }, [ageParam]);

  // Size pills metadata
  const sizesList = ["0M", "3M", "1Y", "2Y", "4Y", "6Y", "8Y", "10Y", "12Y"];

  // Toggle size chips
  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Helper to map product ageRange into categories
  const matchesAge = (productAgeRange) => {
    const age = productAgeRange.toLowerCase();
    const activeAges = Object.keys(selectedAges).filter((k) => selectedAges[k]);

    // If no age filter is active, match everything
    if (activeAges.length === 0) return true;

    return activeAges.some((filterKey) => {
      if (filterKey === "baby") return age.includes("0-12m") || age.includes("baby");
      if (filterKey === "toddler") return age.includes("3–7") || age.includes("3-7") || age.includes("1-3");
      if (filterKey === "kids") return age.includes("4–8") || age.includes("5–9") || age.includes("6–10") || age.includes("kids");
      if (filterKey === "tweens") return age.includes("10–14") || age.includes("tweens");
      return false;
    });
  };

  // Helper to map name or tags into category filters
  const matchesCategory = (product) => {
    const activeCats = Object.keys(selectedCategories).filter(
      (k) => selectedCategories[k]
    );
    if (activeCats.length === 0) return true;

    const name = product.name.toLowerCase();
    return activeCats.some((cat) => {
      if (cat === "tops") return name.includes("tee") || name.includes("top");
      if (cat === "dresses") return name.includes("dress") || name.includes("romper");
      if (cat === "bottoms") return name.includes("shorts") || name.includes("jogger") || name.includes("socks");
      if (cat === "sets") return name.includes("set") || name.includes("combo");
      return false;
    });
  };

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Tag filters (New / Sale check from URL params)
      if (filterParam === "new" && p.tag !== "New") return false;
      if (filterParam === "sale" && p.tag !== "Sale") return false;

      // 2. Age group filter
      if (!matchesAge(p.ageRange)) return false;

      // 3. Category filter
      if (!matchesCategory(p)) return false;

      // 4. Price slider filter
      if (p.price > maxPrice) return false;

      // 5. Size stock filter (if any size is selected, check product sizes)
      if (selectedSizes.length > 0) {
        const hasSize = p.sizes?.some(
          (sz) => selectedSizes.includes(sz.size) && sz.stock > 0
        );
        if (!hasSize) return false;
      }

      return true;
    });

    // Sort operations
    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedAges, selectedCategories, selectedSizes, maxPrice, sortBy, filterParam]);

  // Mobile clean filters handler
  const handleClearAll = () => {
    setSelectedAges({ baby: false, toddler: false, kids: false, tweens: false });
    setSelectedCategories({ tops: false, dresses: false, bottoms: false, sets: false });
    setSelectedSizes([]);
    setMaxPrice(1500);
    setIsFilterSheetOpen(false);
  };

  return (
    <div id="s-plp">
      {/* Header and Breadcrumbs */}
      <div className="plp-head">
        <div className="plp-head-inner">
          <div>
            <div className="breadcrumb">
              <Link href="/">Home</Link> / All products
            </div>
            <div className="plp-title-text">
              {filterParam === "new"
                ? "New Arrivals 🌟"
                : filterParam === "sale"
                ? "Sale Items 🔥"
                : "All Products 👕"}
            </div>
            <div className="plp-count">{filteredProducts.length} products</div>
          </div>
          <select
            className="sort-btn"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter bar chips */}
      <div className="filter-bar">
        <div
          className={`chip ${
            !selectedAges.baby &&
            !selectedAges.toddler &&
            !selectedAges.kids &&
            !selectedAges.tweens
              ? "on"
              : ""
          }`}
          onClick={handleClearAll}
        >
          All
        </div>
        <div
          className={`chip ${selectedAges.baby ? "on" : ""}`}
          onClick={() =>
            setSelectedAges((prev) => ({ ...prev, baby: !prev.baby }))
          }
        >
          Baby
        </div>
        <div
          className={`chip ${selectedAges.toddler ? "on" : ""}`}
          onClick={() =>
            setSelectedAges((prev) => ({ ...prev, toddler: !prev.toddler }))
          }
        >
          Toddler
        </div>
        <div
          className={`chip ${selectedAges.kids ? "on" : ""}`}
          onClick={() =>
            setSelectedAges((prev) => ({ ...prev, kids: !prev.kids }))
          }
        >
          Kids
        </div>
        <div
          className={`chip ${selectedAges.tweens ? "on" : ""}`}
          onClick={() =>
            setSelectedAges((prev) => ({ ...prev, tweens: !prev.tweens }))
          }
        >
          Tweens
        </div>
        <div
          className="chip"
          onClick={() => setIsFilterSheetOpen(true)}
          style={{ marginLeft: "auto", fontWeight: "bold" }}
        >
          ⚙️ Filters
        </div>
      </div>

      {/* Mobile Filters Sliding Drawer overlay */}
      <div
        className={`overlay ${isFilterSheetOpen ? "open" : ""}`}
        style={{ display: isFilterSheetOpen ? "flex" : "none" }}
        onClick={() => setIsFilterSheetOpen(false)}
      >
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle"></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800" }}>Filter &amp; sort</div>
            <button
              onClick={() => setIsFilterSheetOpen(false)}
              style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--ink3)" }}
            >
              ×
            </button>
          </div>

          <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".5px", color: "var(--ink)", marginBottom: "10px", textAlign: "left" }}>
            Age group
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "16px" }}>
            <div
              className={`chip ${selectedAges.baby ? "on" : ""}`}
              onClick={() =>
                setSelectedAges((prev) => ({ ...prev, baby: !prev.baby }))
              }
            >
              Baby (0–12m)
            </div>
            <div
              className={`chip ${selectedAges.toddler ? "on" : ""}`}
              onClick={() =>
                setSelectedAges((prev) => ({ ...prev, toddler: !prev.toddler }))
              }
            >
              Toddler (1–3y)
            </div>
            <div
              className={`chip ${selectedAges.kids ? "on" : ""}`}
              onClick={() =>
                setSelectedAges((prev) => ({ ...prev, kids: !prev.kids }))
              }
            >
              Kids (4–10y)
            </div>
            <div
              className={`chip ${selectedAges.tweens ? "on" : ""}`}
              onClick={() =>
                setSelectedAges((prev) => ({ ...prev, tweens: !prev.tweens }))
              }
            >
              Tweens (11–14y)
            </div>
          </div>

          <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".5px", color: "var(--ink)", marginBottom: "10px", textAlign: "left" }}>
            Price range (Max: ₹{maxPrice})
          </div>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--coral)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ink3)" }}>
              <span>₹300</span>
              <span>₹{maxPrice}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-outline" style={{ flex: 1, padding: "11px" }} onClick={handleClearAll}>
              Clear All
            </button>
            <button className="btn btn-primary" style={{ flex: 2, padding: "11px" }} onClick={() => setIsFilterSheetOpen(false)}>
              Apply filters
            </button>
          </div>
        </div>
      </div>

      {/* Main PLP Body Layout (Sidebar + Grid) */}
      <div className="plp-body page-body">
        {/* Desktop Sidebar Filters */}
        <aside className="plp-sidebar">
          <div className="filter-group">
            <div className="filter-label">Age group</div>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedAges.baby}
                onChange={() =>
                  setSelectedAges((prev) => ({ ...prev, baby: !prev.baby }))
                }
              />
              Newborn (0–12m)
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedAges.toddler}
                onChange={() =>
                  setSelectedAges((prev) => ({ ...prev, toddler: !prev.toddler }))
                }
              />
              Toddler (1–3y)
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedAges.kids}
                onChange={() =>
                  setSelectedAges((prev) => ({ ...prev, kids: !prev.kids }))
                }
              />
              Kids (4–10y)
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedAges.tweens}
                onChange={() =>
                  setSelectedAges((prev) => ({ ...prev, tweens: !prev.tweens }))
                }
              />
              Tweens (11–14y)
            </label>
          </div>

          <div className="filter-group">
            <div className="filter-label">Category</div>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedCategories.tops}
                onChange={() =>
                  setSelectedCategories((prev) => ({ ...prev, tops: !prev.tops }))
                }
              />
              Tops &amp; Tees
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedCategories.dresses}
                onChange={() =>
                  setSelectedCategories((prev) => ({ ...prev, dresses: !prev.dresses }))
                }
              />
              Dresses &amp; Rompers
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedCategories.bottoms}
                onChange={() =>
                  setSelectedCategories((prev) => ({ ...prev, bottoms: !prev.bottoms }))
                }
              />
              Bottoms &amp; Socks
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={selectedCategories.sets}
                onChange={() =>
                  setSelectedCategories((prev) => ({ ...prev, sets: !prev.sets }))
                }
              />
              Sets &amp; Coordinates
            </label>
          </div>

          <div className="filter-group">
            <div className="filter-label">Sizes</div>
            <div className="size-pills">
              {sizesList.map((size) => (
                <div
                  key={size}
                  className={`chip ${selectedSizes.includes(size) ? "on" : ""}`}
                  style={{ fontSize: "11px", padding: "5px 10px" }}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="filter-group" style={{ border: "none" }}>
            <div className="filter-label">Price range (Max: ₹{maxPrice})</div>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--coral)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ink3)", marginTop: "6px" }}>
              <span>₹300</span>
              <span>₹1,500</span>
            </div>
          </div>
        </aside>

        {/* Product Grid section */}
        <div className="plp-grid-wrap">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "56px", marginBottom: "14px" }}>😕</div>
              <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>No products match filters</div>
              <div style={{ fontSize: "13px", color: "var(--ink3)" }}>Try clearing or relaxing your search filters!</div>
            </div>
          ) : (
            <div className="grid-3">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
