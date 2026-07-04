"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const {
    cart,
    setCart,
    user,
    getCartSubtotal,
    getCartDiscount,
    getShippingCharge,
    getCartTotal,
    appliedCoupon,
    redeemedCoins,
    setRedeemedCoins,
    clearCoupon,
    showToast,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("UPI"); // "UPI", "Card", "COD"
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [addressId, setAddressId] = useState(null);
  
  // Simulated gateway loader overlay states
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting to secure payment gateway...");

  useEffect(() => {
    // Retrieve values from address step
    const savedAddrId = localStorage.getItem("nvy_checkout_addr_id");
    const savedShipping = localStorage.getItem("nvy_checkout_shipping") || "standard";
    
    if (!user) {
      router.push("/account");
      return;
    }
    if (!savedAddrId || cart.length === 0) {
      showToast("⚠️ Checkout session invalid, redirected to cart");
      router.push("/cart");
      return;
    }

    setAddressId(parseInt(savedAddrId));
    setShippingMethod(savedShipping);
  }, [user, cart]);

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setStatusMessage("🔒 Contacting secure bank server...");

    try {
      const selectedAddress = user.addresses.find((a) => a.id === addressId);
      const subtotal = getCartSubtotal();
      const discount = getCartDiscount();
      const shippingCharge = getShippingCharge() + (shippingMethod === "express" ? 99 : 0);
      const totalAmount = getCartTotal() + (shippingMethod === "express" ? 99 : 0);

      // 1. Submit order payload to backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          shippingMethod,
          paymentMethod,
          cartItems: cart,
          subtotal,
          discount,
          shipping: shippingCharge,
          total: totalAmount,
          couponCode: appliedCoupon?.code || null,
          coinsRedeemed: redeemedCoins,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProcessing(false);
        showToast("❌ Checkout failed: " + (data.error || "Please try again"));
        return;
      }

      // 2. Play out bank authorization simulation
      setTimeout(() => {
        setStatusMessage("💳 Verifying transaction credentials...");
        setTimeout(async () => {
          setStatusMessage("🎉 Finalizing payment confirmation...");
          
          // Complete payment on server
          await fetch(`/api/orders/${data.orderId}/pay`, {
            method: "POST",
          });

          setTimeout(() => {
            setProcessing(false);
            
            // Clear cart states
            setCart([]);
            setRedeemedCoins(0);
            clearCoupon();
            
            // Clear checkout configs
            localStorage.removeItem("nvy_checkout_addr_id");
            localStorage.removeItem("nvy_checkout_shipping");
            
            showToast("🎉 Payment confirmed!");
            router.push(`/checkout/confirm?orderId=${data.orderId}&method=${paymentMethod}`);
          }, 1000);
        }, 1200);
      }, 1200);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      showToast("❌ An error occurred during payment processing");
    }
  };

  const calculatedTotal = getCartTotal() + (shippingMethod === "express" ? 99 : 0);

  return (
    <div className="checkout-wrap page-body">
      {/* simulated loader overlay modal */}
      {processing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26, 26, 46, 0.95)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "20px", animation: "spin 2s linear infinite" }}>🔄</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Navvyata Checkout Pay Gateway</div>
          <div style={{ fontSize: "14px", color: "var(--teal)" }}>{statusMessage}</div>
        </div>
      )}

      <div className="checkout-form-col">
        {/* Step dots */}
        <div className="step-row">
          <div className="step-dot done">✓</div>
          <div className="step-line done"></div>
          <div className="step-dot act">2</div>
          <div className="step-line"></div>
          <div className="step-dot todo">3</div>
        </div>

        <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--ink)", marginBottom: "16px" }}>
          Payment method
        </div>

        <div
          className={`pay-method ${paymentMethod === "UPI" ? "on" : ""}`}
          onClick={() => setPaymentMethod("UPI")}
          style={{ textAlign: "left" }}
        >
          <div className="pay-icon">📱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>UPI</div>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>GPay, PhonePe, Paytm, BHIM</div>
          </div>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: paymentMethod === "UPI" ? "none" : "2px solid var(--border)",
              background: paymentMethod === "UPI" ? "var(--coral)" : "transparent",
            }}
          />
        </div>

        <div
          className={`pay-method ${paymentMethod === "Card" ? "on" : ""}`}
          onClick={() => setPaymentMethod("Card")}
          style={{ textAlign: "left" }}
        >
          <div className="pay-icon">💳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Credit / Debit card</div>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>Visa, Mastercard, RuPay, Maestro</div>
          </div>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: paymentMethod === "Card" ? "none" : "2px solid var(--border)",
              background: paymentMethod === "Card" ? "var(--coral)" : "transparent",
            }}
          />
        </div>

        <div
          className={`pay-method ${paymentMethod === "COD" ? "on" : ""}`}
          onClick={() => setPaymentMethod("COD")}
          style={{ textAlign: "left" }}
        >
          <div className="pay-icon">📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Cash on delivery</div>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>Pay in cash or digital scan when it arrives</div>
          </div>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: paymentMethod === "COD" ? "none" : "2px solid var(--border)",
              background: paymentMethod === "COD" ? "var(--coral)" : "transparent",
            }}
          />
        </div>
      </div>

      {/* Summary box sidebar */}
      <div>
        <div className="order-summary-box">
          <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--ink)", marginBottom: "14px" }}>
            Order summary
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--ink2)", marginBottom: "14px" }}>
            <span>Total</span>
            <span style={{ fontWeight: "800", color: "var(--coral)" }}>
              ₹{calculatedTotal.toLocaleString()}
            </span>
          </div>
          <button className="btn btn-primary btn-full" id="paybtn" onClick={handlePlaceOrder}>
            Pay ₹{calculatedTotal.toLocaleString()} →
          </button>
          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--ink3)", marginTop: "12px" }}>
            🔒 256-bit SSL encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
