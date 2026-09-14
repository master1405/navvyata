"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { INDIAN_STATES } from "@/app/lib/constants";

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
  const [formErrors, setFormErrors] = useState({});

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

  /**
   * Strict validation for Indian logistics:
   * - 6-digit postal code (PIN)
   * - 10-digit mobile number starting with 6-9
   * - City name (alphabetic, spaces, hyphens)
   * - State selected from predefined list of 28 states & 8 UTs
   */
  const validateForm = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 3) {
      errs.name = "Enter your full name (minimum 3 characters)";
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!addressLine.trim() || addressLine.trim().length < 5) {
      errs.address = "Enter flat, house number, building & street";
    }
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit postal pincode";
    }
    if (!city.trim() || !/^[a-zA-Z\s.-]{2,50}$/.test(city.trim())) {
      errs.city = "Enter a valid city name (letters only)";
    }
    if (!stateName.trim()) {
      errs.state = "Please select your state / union territory";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("⚠️ Please correct the errors in the address form");
      return;
    }

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: addressLine.trim(),
          pincode: pincode.trim(),
          city: city.trim(),
          state: stateName.trim(),
          type: addrType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ Address saved!");
        await refreshUserProfile();
        setActiveAddressId(data.address.id);
        // Clear inputs
        setName("");
        setPhone("");
        setAddressLine("");
        setPincode("");
        setCity("");
        setStateName("");
        setAddrType("Home");
        setFormErrors({});
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
                  <label>Full name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) setFormErrors((p) => ({ ...p, name: null }));
                    }}
                  />
                  {formErrors.name && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.name}</div>}
                </div>
                <div className="field">
                  <label>Mobile phone *</label>
                  <input
                    className="inp"
                    placeholder="10-digit number"
                    maxLength="10"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: null }));
                    }}
                  />
                  {formErrors.phone && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.phone}</div>}
                </div>
              </div>
              <div className="field">
                <label>Address (Flat, building, street, area) *</label>
                <input
                  className="inp"
                  placeholder="Flat, building, street, area"
                  value={addressLine}
                  onChange={(e) => {
                    setAddressLine(e.target.value);
                    if (formErrors.address) setFormErrors((p) => ({ ...p, address: null }));
                  }}
                />
                {formErrors.address && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.address}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Pincode *</label>
                  <input
                    className="inp"
                    placeholder="e.g. 440010"
                    maxLength="6"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      if (formErrors.pincode) setFormErrors((p) => ({ ...p, pincode: null }));
                    }}
                  />
                  {formErrors.pincode && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.pincode}</div>}
                </div>
                <div className="field">
                  <label>City *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Nagpur"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (formErrors.city) setFormErrors((p) => ({ ...p, city: null }));
                    }}
                  />
                  {formErrors.city && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.city}</div>}
                </div>
              </div>
              <div className="field">
                <label>State / Union Territory *</label>
                <select
                  className="inp"
                  value={stateName}
                  onChange={(e) => {
                    setStateName(e.target.value);
                    if (formErrors.state) setFormErrors((p) => ({ ...p, state: null }));
                  }}
                >
                  <option value="">-- Select State / UT --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {formErrors.state && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{formErrors.state}</div>}
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
