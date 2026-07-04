"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductCard from "@/app/components/ProductCard";

export default function ProductClient({ product, completeLook }) {
  const { addToCart, toggleWishlist, wishlist, showToast } = useCart();

  // Selected State
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState("Coral");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Gallery States
  const [mainImage, setMainImage] = useState(product.emoji);
  const [mainBg, setMainBg] = useState(product.bg);
  const [activeThumb, setActiveThumb] = useState(0);

  // Sizing Calculator States
  const [calcAge, setCalcAge] = useState("");
  const [calcHeight, setCalcHeight] = useState("");
  const [calculatedSizeRec, setCalculatedSizeRec] = useState("");

  const isWished = wishlist.some((item) => item.id === product.id);

  // Update gallery if product emoji/bg changes
  useEffect(() => {
    setMainImage(product.emoji);
    setMainBg(product.bg);
    setActiveThumb(0);
    setSelectedSize(null);
    setQty(1);
    setSizeError(false);
    setCalculatedSizeRec("");
    setCalcAge("");
    setCalcHeight("");
  }, [product]);

  // Gallery thumbnails definitions
  const thumbs = [
    { emoji: product.emoji, bg: product.bg },
    { emoji: "🌿", bg: "var(--teal-l)" },
    { emoji: "⭐", bg: "var(--sun-l)" },
  ];

  // Sizing calculator algorithm
  const handleCalcSize = () => {
    const age = parseFloat(calcAge) || 0;
    const ht = parseFloat(calcHeight) || 0;
    let rec = "";

    if (ht >= 122) rec = "7–8Y";
    else if (ht >= 116) rec = "5–6Y";
    else if (ht >= 110) rec = "4–5Y";
    else if (ht >= 104) rec = "3–4Y";
    else if (age >= 6) rec = "5–6Y";
    else if (age >= 5) rec = "4–5Y";
    else if (age >= 4) rec = "3–4Y";
    else if (age >= 3) rec = "3–4Y";
    else rec = "Check baby sizes";

    setCalculatedSizeRec(rec);

    // Auto-select the size if it's available in the list
    const foundSize = product.sizes?.find((sz) => sz.size.trim() === rec);
    if (foundSize && foundSize.stock > 0) {
      setSelectedSize(rec);
      setSizeError(false);
      showToast(`✅ Recommended size ${rec} auto-selected!`);
    } else {
      showToast(`💡 Recommended size: ${rec}`);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      showToast("⚠️ Please select a size first");
      return;
    }
    setSizeError(false);

    // Create item details with size/color metadata
    const sizeDetails = `${selectedSize} · ${selectedColor}`;
    // Add multiple quantities by loop or context quantity support
    for (let i = 0; i < qty; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
  };

  // Color options maps
  const colorOptions = [
    { name: "Coral", color: "var(--coral)" },
    { name: "Teal", color: "var(--teal)" },
    { name: "Yellow", color: "var(--sun)" },
    { name: "Purple", color: "var(--purple)" },
  ];

  return (
    <div id="s-pdp">
      <div className="section" style={{ paddingBottom: 0, paddingTop: "16px" }}>
        <div className="breadcrumb" style={{ textAlign: "left" }}>
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.name}
        </div>
      </div>

      <div className="pdp-wrap page-body">
        {/* Gallery thumbnails */}
        <div className="pdp-gallery">
          <div id="pdpimg" className="pdp-main-img" style={{ background: mainBg }}>
            {mainImage}
          </div>
          <div className="pdp-thumbs">
            {thumbs.map((t, idx) => (
              <div
                key={idx}
                className={`pdp-thumb ${activeThumb === idx ? "on" : ""}`}
                style={{ background: t.bg }}
                onClick={() => {
                  setMainImage(t.emoji);
                  setMainBg(t.bg);
                  setActiveThumb(idx);
                }}
              >
                {t.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Panel */}
        <div className="pdp-info">
          <div className="pdp-name">{product.name}</div>
          <div className="pdp-rating">
            <span style={{ color: "var(--sun)", fontSize: "14px" }}>★★★★★</span>
            <span style={{ fontSize: "13px", fontWeight: "700" }}>4.9</span>
            <span
              style={{ fontSize: "13px", color: "var(--teal-d)", cursor: "pointer", fontWeight: "600" }}
              onClick={() => {
                document.getElementById("reviews-sec")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {product.reviews?.length || 128} reviews →
            </span>
          </div>

          <div className="pdp-price-row">
            <span className="pdp-price">₹{product.price}</span>
            {product.oldPrice && (
              <>
                <span className="pdp-old">₹{product.oldPrice}</span>
                <span className="pill p-g">
                  Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Social nudge widgets */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "-10px", marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", color: "var(--teal-d)", fontWeight: "600" }}>
              📱 Or ₹{Math.round(product.price / 3)}/mo with no-cost EMI ·{" "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => showToast("Simpl, LazyPay, and ZestMoney supported at checkout")}
              >
                See options
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--coral-l)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
              <span style={{ fontSize: "14px" }}>🔥</span>
              <span style={{ fontSize: "12px", color: "var(--coral-d)", fontWeight: "600" }}>
                23 parents are viewing this right now · 47 sold today
              </span>
            </div>
          </div>

          {/* Size calculator section */}
          <div className="pdp-section">
            <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "12px", color: "var(--ink2)" }}>
                Fit: <span style={{ fontWeight: 700, color: "var(--ink)" }}>Runs true to size</span>
              </div>
              <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                <div style={{ height: "5px", width: "18px", borderRadius: "2px", background: "var(--teal)" }}></div>
                <div style={{ height: "5px", width: "18px", borderRadius: "2px", background: "var(--teal)" }}></div>
                <div style={{ height: "5px", width: "18px", borderRadius: "2px", background: "var(--teal)", opacity: 0.3 }}></div>
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>94% agree</div>
            </div>

            <div style={{ background: "var(--teal-l)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--teal-d)", marginBottom: "8px" }}>
                🔢 Find your child's size
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  placeholder="Age (yrs)"
                  type="number"
                  min="0"
                  max="14"
                  style={{ flex: 1, padding: "8px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", outline: "none", width: 0 }}
                  value={calcAge}
                  onChange={(e) => setCalcAge(e.target.value)}
                />
                <input
                  placeholder="Height (cm)"
                  type="number"
                  style={{ flex: 1, padding: "8px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", outline: "none", width: 0 }}
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                />
                <button
                  onClick={handleCalcSize}
                  style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Get size
                </button>
              </div>
              {calculatedSizeRec && (
                <div id="size-rec" style={{ marginTop: "8px", fontSize: "12px", fontWeight: "700", color: "var(--teal-d)" }}>
                  ✅ Recommended size: {calculatedSizeRec}
                </div>
              )}
            </div>

            <div className="pdp-section-label">
              Select size
              {sizeError && (
                <span id="szerr" style={{ color: "var(--coral)", fontWeight: "400", textTransform: "none", fontSize: "11px", display: "inline" }}>
                  {" "}← please select
                </span>
              )}
              <Link href="/sizeguide" style={{ fontSize: "12px", color: "var(--teal-d)", textTransform: "none", letterSpacing: 0, fontWeight: "600" }}>
                Size guide →
              </Link>
            </div>

            {/* Size chip listings */}
            <div className="pdp-size-row" id="szchips">
              {product.sizes?.map((sz) => {
                const outOfStock = sz.stock <= 0;
                return (
                  <div
                    key={sz.id}
                    className={`pdp-size ${selectedSize === sz.size ? "on" : ""}`}
                    style={
                      outOfStock
                        ? { opacity: 0.45, textDecoration: "line-through", cursor: "not-allowed" }
                        : { position: "relative" }
                    }
                    onClick={() => {
                      if (!outOfStock) {
                        setSelectedSize(sz.size);
                        setSizeError(false);
                      } else {
                        showToast(`❌ Size ${sz.size} is currently out of stock`);
                      }
                    }}
                  >
                    {sz.size}
                    {sz.stock > 0 && sz.stock <= 2 && (
                      <span style={{ position: "absolute", top: "-7px", right: "-7px", background: "var(--coral)", color: "#fff", fontSize: "8px", padding: "1px 4px", borderRadius: "4px", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {sz.stock} left
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Selector dots */}
          <div className="pdp-section">
            <div className="pdp-section-label">
              Color: <span style={{ textTransform: "none", fontWeight: "500", color: "var(--ink2)" }}>{selectedColor}</span>
            </div>
            <div className="pdp-colors" id="colrow">
              {colorOptions.map((c) => (
                <div
                  key={c.name}
                  className={`pdp-color ${selectedColor === c.name ? "on" : ""}`}
                  style={{ background: c.color }}
                  onClick={() => setSelectedColor(c.name)}
                />
              ))}
            </div>
          </div>

          {/* Quantity selection */}
          <div className="pdp-section">
            <div className="pdp-section-label">Quantity</div>
            <div className="pdp-qty">
              <button className="pdp-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span id="pdpqty" style={{ fontSize: "16px", fontWeight: "700", minWidth: "22px", textAlign: "center" }}>{qty}</span>
              <button className="pdp-qty-btn" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
            </div>
          </div>

          {/* E-commerce trust bullet details */}
          <div className="pdp-features">
            <div className="pdp-feat">🌿 Organic cotton</div>
            <div className="pdp-feat">🔄 Machine washable</div>
            <div className="pdp-feat">🚚 Free ship ₹999+</div>
            <div className="pdp-feat">🛡️ OEKO-TEX safe</div>
          </div>

          {/* Dynamic CTAs */}
          <div className="pdp-ctas">
            <button className="pdp-wish-btn" id="wcta" onClick={() => toggleWishlist(product)}>
              {isWished ? "❤️" : "🤍"}
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart}>
              Add to cart — ₹{product.price * qty}
            </button>
          </div>

          {/* Exchange assurance */}
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ background: "var(--green-l)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🛡️</span>
              <div style={{ fontSize: "12px", color: "var(--green-d)", fontWeight: "600", textAlign: "left" }}>
                Free 30-day returns · Wrong size? Free exchange · No questions asked
              </div>
            </div>
            <button
              onClick={() => showToast("💬 Opening WhatsApp consultation support...")}
              style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "11px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}
            >
              <span style={{ fontSize: "16px" }}>💬</span> Chat on WhatsApp — get size advice in 2 min
            </button>
          </div>
        </div>
      </div>

      {/* Complete the look suggestions */}
      <div className="section" style={{ paddingTop: "32px", borderTop: "1px solid var(--border)" }}>
        <div className="sec-title" style={{ fontSize: "20px", marginBottom: "20px", textAlign: "left" }}>
          Complete the look
        </div>
        <div className="grid-4">
          {completeLook.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* Customer review panels */}
      <div className="section" style={{ borderTop: "1px solid var(--border)", paddingTop: "40px" }} id="reviews-sec">
        <div className="sec-title" style={{ fontSize: "20px", marginBottom: "20px", textAlign: "left" }}>
          Customer reviews
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", padding: "20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: "48px", fontWeight: "900", color: "var(--ink)" }}>4.9</div>
            <div style={{ color: "var(--sun)", fontSize: "18px" }}>★★★★★</div>
            <div style={{ fontSize: "12px", color: "var(--ink3)", marginTop: "3px" }}>
              {product.reviews?.length || 0} reviews
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <span style={{ fontSize: "12px", color: "var(--ink3)", width: "12px" }}>5</span>
              <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "88%", height: "100%", background: "var(--sun)" }}></div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--ink3)" }}>88%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <span style={{ fontSize: "12px", color: "var(--ink3)", width: "12px" }}>4</span>
              <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "9%", height: "100%", background: "var(--sun)" }}></div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--ink3)" }}>9%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--ink3)", width: "12px" }}>3</span>
              <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "3%", height: "100%", background: "var(--sun)" }}></div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--ink3)" }}>3%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Reviews cards list */}
        <div className="review-grid">
          {product.reviews?.length > 0 ? (
            product.reviews.map((rev) => (
              <div className="review-card" key={rev.id}>
                <div className="review-top">
                  <div className="review-avatar" style={{ background: rev.avatarBg, color: rev.avatarFg }}>
                    {rev.userName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{rev.userName}</div>
                    <div style={{ color: "var(--sun)", fontSize: "12px" }}>{"★".repeat(rev.rating)}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: "11px", color: "var(--ink3)" }}>
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.7", textAlign: "left" }}>
                  {rev.comment}
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "30px", color: "var(--ink3)" }}>
              No reviews yet for this product. Be the first to write a review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
