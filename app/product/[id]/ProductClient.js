"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductCard from "@/app/components/ProductCard";
import { getRecommendedSize } from "@/app/lib/constants";

export default function ProductClient({ product, completeLook }) {
  const { addToCart, toggleWishlist, wishlist, showToast, user } = useCart();

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

  /**
   * Pediatric Sizing Calculation Engine:
   * Uses WHO growth standards from getRecommendedSize() covering 0M to 14Y.
   */
  const handleCalcSize = () => {
    if (!calcAge && !calcHeight) {
      showToast("⚠️ Please enter your child's age or height");
      return;
    }

    const rec = getRecommendedSize(calcAge, calcHeight);
    setCalculatedSizeRec(rec);

    // Auto-match against product available stock sizes
    const foundSize = product.sizes?.find((sz) => sz.size.trim() === rec || sz.size.includes(rec));
    if (foundSize && foundSize.stock > 0) {
      setSelectedSize(foundSize.size);
      setSizeError(false);
      showToast(`✅ Recommended size ${foundSize.size} applied!`);
    } else if (foundSize && foundSize.stock <= 0) {
      showToast(`⚠️ Recommended size ${foundSize.size} is out of stock`);
    } else {
      showToast(`💡 Recommended size: ${rec}`);
    }
  };

  /**
   * 1-Click Child Profile Size Selection
   */
  const handleSelectChildProfile = (child) => {
    const targetSize = child.size;
    const matching = product.sizes?.find((sz) => sz.size.trim() === targetSize || sz.size.includes(targetSize));
    if (matching && matching.stock > 0) {
      setSelectedSize(matching.size);
      setSizeError(false);
      showToast(`✅ Selected size ${matching.size} for ${child.name}`);
    } else if (matching && matching.stock <= 0) {
      showToast(`⚠️ Size ${targetSize} for ${child.name} is currently out of stock`);
    } else {
      showToast(`ℹ️ Product does not carry size ${targetSize} for ${child.name}`);
    }
  };

  /**
   * Real WhatsApp Consultation Redirect:
   * Opens direct chat with customer support with product and sizing context.
   */
  const handleWhatsAppConsult = () => {
    const message = `Hi Navvyata Team! I would like size and styling advice for "${product.name}" (Item #${product.id}, Price: ₹${product.price}). Can you help recommend the best fit?`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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

            {/* Sizing Recommendations & Calculator */}
            <div style={{ background: "var(--teal-l)", borderRadius: "var(--radius-sm)", padding: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--teal-d)" }}>
                  🔢 Find your child's size
                </span>
                <Link href="/sizeguide" style={{ fontSize: "11px", color: "var(--teal-d)", fontWeight: "600", textDecoration: "underline" }}>
                  Full Size Guide →
                </Link>
              </div>

              {/* Saved Child Profile Quick Selectors */}
              {user?.childProfiles && user.childProfiles.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px dashed rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: "11px", color: "var(--ink2)", marginBottom: "6px" }}>
                    Select size for your child:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.childProfiles.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectChildProfile(c)}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--border)",
                          borderRadius: "50px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                          color: "var(--ink)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>👧 {c.name}</span>
                        <span style={{ color: "var(--coral-d)", fontWeight: "700" }}>({c.size})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Sizing Inputs */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  placeholder="Age (0–14 yrs)"
                  type="number"
                  min="0"
                  max="14"
                  step="0.5"
                  style={{ flex: 1, padding: "8px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", outline: "none", width: 0, background: "#fff" }}
                  value={calcAge}
                  onChange={(e) => setCalcAge(e.target.value)}
                />
                <input
                  placeholder="Height (cm)"
                  type="number"
                  style={{ flex: 1, padding: "8px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", outline: "none", width: 0, background: "#fff" }}
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCalcSize}
                  style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Find Size
                </button>
              </div>

              {calculatedSizeRec && (
                <div id="size-rec" style={{ marginTop: "10px", fontSize: "12px", fontWeight: "700", color: "var(--teal-d)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✅ Recommended size:</span>
                  <span style={{ background: "var(--teal)", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>
                    {calculatedSizeRec}
                  </span>
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
              onClick={handleWhatsAppConsult}
              style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}
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
