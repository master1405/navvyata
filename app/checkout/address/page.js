"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function CheckoutAddressPage() {
  const router = useRouter();
  const {
    user,
    getCartTotal,
    refreshUserProfile,
    showToast,
  } = useCart();

  const [activeAddressId, setActiveAddressId] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard"); // "standard" or "express"
  
  // New Address form modal states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [addrType, setAddrType] = useState("Home");

  // Redirect to account login if user not logged in
  useEffect(() => {
    if (!user) {
      showToast("🔑 Please sign in to access checkout");
      router.push("/account?redirect=/checkout/address");
    } else if (user.addresses && user.addresses.length > 0) {
      // Auto-select default address
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setActiveAddressId(def.id);
    }
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !addressLine.trim() || !pincode.trim() || !city.trim() || !stateName.trim()) {
      showToast("⚠️ Please fill out all fields");
      return;
    }

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address: addressLine,
          pincode,
          city,
          state: stateName,
          type: addrType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ Address saved!");
        await refreshUserProfile();
        // Clear inputs
        setName("");
        setPhone("");
        setAddressLine("");
        setPincode("");
        setCity("");
        setStateName("");
        setAddrType("Home");
        setShowForm(false);
      } else {
        showToast("❌ " + (data.error || "Failed to save address"));
      }
    } catch (err) {
      showToast("❌ Error saving address");
    }
  };

  const handleContinueToPayment = () => {
    if (!activeAddressId) {
      showToast("⚠️ Please select a delivery address first");
      return;
    }
    // Save selected address ID and shipping method in session/local storage for payment page
    localStorage.setItem("nvy_checkout_addr_id", activeAddressId);
    localStorage.setItem("nvy_checkout_shipping", shippingMethod);
    router.push("/checkout/payment");
  };

  const calculatedTotal = getCartTotal() + (shippingMethod === "express" ? 99 : 0);

  return (
    <div className="checkout-wrap page-body">
      <div className="checkout-form-col">
        {/* Step dots */}
        <div className="step-row">
          <div style={{ textAlign: "center" }}><div className="step-dot act">1</div></div>
          <div className="step-line"></div>
          <div style={{ textAlign: "center" }}><div className="step-dot todo">2</div></div>
          <div className="step-line"></div>
          <div style={{ textAlign: "center" }}><div className="step-dot todo">3</div></div>
        </div>

        <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--ink)", marginBottom: "16px" }}>
          Delivery address
        </div>

        {/* Addresses list */}
        {user?.addresses?.map((addr) => (
          <div
            key={addr.id}
            className={`addr-card ${activeAddressId === addr.id ? "on" : ""}`}
            onClick={() => setActiveAddressId(addr.id)}
            style={{ textAlign: "left" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontWeight: "700", color: "var(--coral-d)", fontSize: "13px" }}>
                {addr.type === "Home" ? "🏠 Home" : addr.type === "Office" ? "🏢 Office" : "📍 Other"}{" "}
                {addr.isDefault && <span className="pill p-c">Default</span>}
              </span>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: activeAddressId === addr.id ? "none" : "2px solid var(--border)",
                  background: activeAddressId === addr.id ? "var(--coral)" : "transparent",
                }}
              />
            </div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.6" }}>
              {addr.name} · {addr.phone}
              <br />
              {addr.address}
              <br />
              {addr.city}, {addr.state} – {addr.pincode}
            </div>
          </div>
        ))}

        {/* Add Address button */}
        {!showForm && (
          <div
            onClick={() => setShowForm(true)}
            style={{
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--radius)",
              padding: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "22px",
              background: "#fff",
            }}
          >
            <span style={{ color: "var(--coral)", fontSize: "18px" }}>＋</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--coral)" }}>Add new address</span>
          </div>
        )}

        {/* Add Address Form Modal */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px",
              marginBottom: "22px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900" }}>Add new address</span>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink3)" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Full name</label>
                  <input className="inp" placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="inp" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Address</label>
                <input className="inp" placeholder="Flat, building, street, area" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Pincode</label>
                  <input className="inp" placeholder="e.g. 440010" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
                <div className="field">
                  <label>City</label>
                  <input className="inp" placeholder="e.g. Nagpur" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>State</label>
                <input className="inp" placeholder="e.g. Maharashtra" value={stateName} onChange={(e) => setStateName(e.target.value)} />
              </div>
              <div className="field">
                <label>Type</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["Home", "Office", "Other"].map((t) => (
                    <div
                      key={t}
                      className={`chip ${addrType === t ? "on" : ""}`}
                      onClick={() => setAddrType(t)}
                    >
                      {t === "Home" ? "🏠 Home" : t === "Office" ? "🏢 Office" : "📍 Other"}
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: "12px" }}>
                Save address
              </button>
            </form>
          </div>
        )}

        {/* Shipping Preference */}
        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)", marginBottom: "12px" }}>
          Delivery preference
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              flex: 1,
              background: shippingMethod === "standard" ? "var(--teal-l)" : "#fff",
              border: shippingMethod === "standard" ? "2px solid var(--teal)" : "1.5px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "14px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setShippingMethod("standard")}
          >
            <div style={{ fontSize: "13px", fontWeight: "700", color: shippingMethod === "standard" ? "var(--teal-d)" : "inherit" }}>
              Standard
            </div>
            <div style={{ fontSize: "11px", color: shippingMethod === "standard" ? "var(--teal-d)" : "var(--ink3)" }}>
              3–5 days · FREE
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: shippingMethod === "express" ? "var(--teal-l)" : "#fff",
              border: shippingMethod === "express" ? "2px solid var(--teal)" : "1.5px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "14px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setShippingMethod("express")}
          >
            <div style={{ fontSize: "13px", fontWeight: "700", color: shippingMethod === "express" ? "var(--teal-d)" : "inherit" }}>
              Express
            </div>
            <div style={{ fontSize: "11px", color: shippingMethod === "express" ? "var(--teal-d)" : "var(--ink3)" }}>
              1–2 days · ₹99
            </div>
          </div>
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
            <span style={{ fontWeight: "800", color: "var(--coral)" }} id="cototal">
              ₹{calculatedTotal.toLocaleString()}
            </span>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleContinueToPayment}>
            Continue to payment →
          </button>
        </div>
      </div>
    </div>
  );
}
