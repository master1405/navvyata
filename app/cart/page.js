"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    user,
    getCartSubtotal,
    getCartDiscount,
    getShippingCharge,
    getCartTotal,
    updateCartQty,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
    clearCoupon,
    redeemedCoins,
    setRedeemedCoins,
    addToCart,
    showToast,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCouponCode(couponInput.trim());
    if (success) setCouponInput("");
  };

  const handleToggleCoins = () => {
    if (!user) {
      showToast("👤 Please sign in to redeem reward coins");
      router.push("/account?redirect=/cart");
      return;
    }

    if (redeemedCoins > 0) {
      setRedeemedCoins(0);
      showToast("🔄 Coin discount removed");
    } else {
      if (user.coins > 0) {
        setRedeemedCoins(user.coins);
        showToast(`🌟 Redeemed ${user.coins} coins!`);
      } else {
        showToast("😕 You have 0 reward coins to redeem");
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      showToast("🔑 Please sign in to proceed to checkout");
      router.push("/account?redirect=/checkout/address");
    } else {
      router.push("/checkout/address");
    }
  };

  const upsellItems = [
    { id: 7, emoji: "🧢", name: "Fun Cap", price: 299, bg: "var(--sun-l)" },
    { id: 8, emoji: "🩳", name: "Denim Shorts", price: 449, bg: "var(--teal-l)" },
    { id: 9, emoji: "🧦", name: "Cute Socks", price: 149, bg: "var(--purple-l)" },
  ];

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="cart-wrap page-body">
      {/* Cart Items list */}
      <div>
        <div
          style={{ fontSize: "22px", fontWeight: "900", color: "var(--ink)", marginBottom: "20px" }}
          id="cart-title"
        >
          Your cart {totalCartQty > 0 ? `(${totalCartQty} item${totalCartQty !== 1 ? "s" : ""})` : ""}
        </div>

        {cart.length === 0 ? (
          <div
            id="cempty"
            style={{
              textAlign: "center",
              padding: "56px 20px",
              background: "#fff",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "14px" }}>🛒</div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Your cart is empty</div>
            <div style={{ fontSize: "13px", color: "var(--ink3)", marginBottom: "22px" }}>
              Add something to get started!
            </div>
            <Link href="/shop">
              <button className="btn btn-primary">Start shopping →</button>
            </Link>
          </div>
        ) : (
          <div id="citems">
            {cart.map((item, idx) => (
              <div className="cart-item" key={idx}>
                <div className="cart-item-img" style={{ background: item.bg }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", marginBottom: "3px" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink3)", marginBottom: "10px" }}>
                    Size: {item.size} · Color: {item.color}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="cart-qty-row">
                      <button className="cqb" onClick={() => updateCartQty(idx, -1)}>
                        −
                      </button>
                      <span style={{ fontSize: "14px", fontWeight: "700", minWidth: "18px", textAlign: "center" }}>
                        {item.qty}
                      </span>
                      <button className="cqb" onClick={() => updateCartQty(idx, 1)}>
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--coral)" }}>
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--ink3)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginLeft: "auto",
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upsell Grid */}
        {cart.length > 0 && (
          <div id="upsell-wrap" style={{ marginTop: "20px", textAlign: "left" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)", marginBottom: "12px" }}>
              You might also need
            </div>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
              {upsellItems.map((u) => (
                <div
                  key={u.id}
                  onClick={() => addToCart(u, "One size", "Default")}
                  style={{
                    flex: "0 0 110px",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "box-shadow .15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = "")}
                >
                  <div style={{ fontSize: "28px" }}>{u.emoji}</div>
                  <div style={{ fontSize: "11px", fontWeight: "600", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--coral)", fontWeight: "700" }}>₹{u.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Sidebar */}
      {cart.length > 0 && (
        <div className="order-summary-box" id="summary-box" style={{ height: "fit-content", position: "sticky", top: "calc(var(--nav-h) + 16px)" }}>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)", marginBottom: "18px" }}>
            Order summary
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--ink2)", marginBottom: "10px" }}>
            <span id="sitemlbl">Items ({totalCartQty})</span>
            <span id="ssub">₹{getCartSubtotal().toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--ink2)", marginBottom: "10px" }}>
            <span>Shipping</span>
            {getShippingCharge() === 0 ? (
              <span style={{ color: "var(--teal-d)", fontWeight: "700" }}>FREE</span>
            ) : (
              <span>₹{getShippingCharge()}</span>
            )}
          </div>

          {getCartDiscount() > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--coral)", marginBottom: "14px" }}>
              <span>Discount</span>
              <span id="sdisc">−₹{getCartDiscount().toLocaleString()}</span>
            </div>
          )}

          {/* Reward coins check selector */}
          {user && user.coins > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--sun-l)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
              onClick={handleToggleCoins}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🌟</span>
                <div>
                  <strong>Redeem {user.coins} coins</strong>
                  <div style={{ fontSize: "10px", color: "var(--ink3)" }}>Save ₹{user.coins * 0.1} instantly</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={redeemedCoins > 0}
                onChange={() => {}} // Controlled by outer div click
                style={{ accentColor: "var(--coral)", cursor: "pointer" }}
              />
            </div>
          )}

          {/* Coupon codes box */}
          <form style={{ display: "flex", gap: "8px", marginBottom: "16px" }} onSubmit={handleApplyCoupon}>
            {appliedCoupon ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  background: "var(--coral-l)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--coral-d)",
                }}
              >
                <span>🎁 {appliedCoupon.code} applied!</span>
                <span style={{ cursor: "pointer", fontSize: "16px" }} onClick={clearCoupon}>
                  ×
                </span>
              </div>
            ) : (
              <>
                <input
                  className="inp"
                  id="cinp"
                  placeholder="Coupon (try NAVVY20)"
                  style={{ flex: 1, fontSize: "12px", padding: "9px 12px" }}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button className="btn btn-outline btn-sm" type="submit">
                  Apply
                </button>
              </>
            )}
          </form>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "800", marginBottom: "18px" }}>
            <span>Total</span>
            <span style={{ color: "var(--coral)" }} id="stotal">
              ₹{getCartTotal().toLocaleString()}
            </span>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleProceedToCheckout}>
            Proceed to checkout →
          </button>
          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--ink3)", marginTop: "12px" }}>
            🔒 Secure and encrypted
          </div>
        </div>
      )}
    </div>
  );
}
