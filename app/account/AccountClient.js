"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    loginUser,
    logoutUser,
    refreshUserProfile,
    showToast,
  } = useCart();

  // Login steps state
  const [step, setStep] = useState("phone"); // "phone" or "otp"
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  
  // Dashboard states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Add child profile states
  const [showChildForm, setShowChildForm] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childHeight, setChildHeight] = useState("");

  const redirectPath = searchParams.get("redirect") || "";

  // Fetch orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 10) {
      showToast("⚠️ Please enter a valid 10-digit mobile number");
      return;
    }
    // Simulate sending OTP
    setStep("otp");
    showToast("📱 OTP sent successfully (Mock Code: 4289)");
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 4) {
      showToast("⚠️ Please enter the 4-digit code");
      return;
    }

    const success = await loginUser(phone, otp);
    if (success) {
      // Clear inputs
      setPhone("");
      setOtpDigits(["", "", "", ""]);
      setStep("phone");
      
      // Redirect if specified
      if (redirectPath) {
        router.push(redirectPath);
      }
    }
  };

  const handleOtpChange = (index, val) => {
    if (isNaN(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.substring(val.length - 1);
    setOtpDigits(newDigits);

    // Focus next input automatically
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childName.trim() || !childAge.trim()) {
      showToast("⚠️ Please enter child's name and age");
      return;
    }

    // Determine size category fallback based on age
    let childSize = "3–4Y";
    const age = parseInt(childAge);
    if (age >= 11) childSize = "11–12Y";
    else if (age >= 10) childSize = "10–11Y";
    else if (age >= 7) childSize = "7–8Y";
    else if (age >= 5) childSize = "5–6Y";
    else if (age >= 4) childSize = "4–5Y";
    else if (age >= 3) childSize = "3–4Y";
    else if (age >= 1) childSize = "1–2Y";
    else childSize = "0–12M";

    try {
      const res = await fetch("/api/user/child-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: childName,
          age: parseInt(childAge),
          height: childHeight ? parseFloat(childHeight) : null,
          size: childSize,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("👶 Child profile added!");
        await refreshUserProfile();
        setChildName("");
        setChildAge("");
        setChildHeight("");
        setShowChildForm(false);
      } else {
        showToast("❌ " + (data.error || "Failed to add profile"));
      }
    } catch (err) {
      showToast("❌ Error saving profile");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px" }}>Loading account profile...</div>;
  }

  // RENDER LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }} className="page-body">
        <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--coral)", marginBottom: "6px" }}>navvyata</div>
        <div style={{ color: "var(--ink3)", marginBottom: "28px", fontSize: "13px" }}>Sign in to continue</div>

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} style={{ textAlign: "left" }}>
            <div className="field">
              <label>Mobile number</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: "700", color: "var(--ink2)" }}>
                  +91
                </span>
                <input
                  className="inp"
                  style={{ paddingLeft: "50px" }}
                  placeholder="98765 43210"
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" style={{ marginBottom: "16px" }}>
              Send OTP →
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>📱</div>
            <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>Verify your number</div>
            <div style={{ fontSize: "13px", color: "var(--ink3)", marginBottom: "24px" }}>
              OTP sent to +91 {phone} (Type 4289)
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  value={digit}
                  maxLength="1"
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  style={{
                    width: "56px",
                    height: "56px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: "700",
                    border: digit ? "2px solid var(--coral)" : "1.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    outline: "none",
                  }}
                />
              ))}
            </div>
            <button className="btn btn-primary btn-full" type="submit" style={{ marginBottom: "12px" }}>
              Verify and login
            </button>
            <div style={{ fontSize: "12px", color: "var(--ink3)" }}>
              Didn't receive?{" "}
              <span
                style={{ color: "var(--coral)", cursor: "pointer", fontWeight: "600" }}
                onClick={() => showToast("📱 Mock OTP resent!")}
              >
                Resend OTP
              </span>
            </div>
          </form>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
          <span style={{ fontSize: "12px", color: "var(--ink3)" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
        </div>

        <button
          onClick={() => {
            loginUser("9876543210", "4289");
          }}
          style={{ width: "100%", background: "#fff", border: "1.5px solid var(--border)", borderRadius: "50px", padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <span style={{ fontWeight: 900, color: "#4285F4", fontSize: "15px" }}>G</span>
          Continue with Google
        </button>
      </div>
    );
  }

  // RENDER LOGGED IN DASHBOARD
  return (
    <div className="account-wrap page-body">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2>Account Details</h2>
          <div style={{ color: "var(--ink3)", fontSize: "14px", marginTop: "4px" }}>📱 +91 {user.phone}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={logoutUser}>
          Logout 🚪
        </button>
      </div>

      <Link href="/rewards" style={{ display: "block", background: "linear-gradient(120deg, var(--coral), #FF8E53)", borderRadius: "var(--radius-lg)", padding: "24px 20px", color: "#fff", textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: ".5px" }}>
          Your rewards balance
        </div>
        <div style={{ fontSize: "36px", fontWeight: "900", margin: "6px 0" }}>🌟 {user.coins}</div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Redeem coins in your cart to save ₹{user.coins * 0.1}!</div>
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--ink)", marginBottom: "14px" }}>
            Kids Profiles
          </div>
          {user.childProfiles?.map((child) => (
            <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", textAlign: "left" }} key={child.id}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--coral-l)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                👧
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{child.name}</div>
                <div style={{ fontSize: "12px", color: "var(--ink3)" }}>
                  {child.age} years · Size: {child.size}
                </div>
              </div>
              {child.isDefault && <span className="pill p-c">Active</span>}
            </div>
          ))}

          {!showChildForm ? (
            <div
              onClick={() => setShowChildForm(true)}
              style={{
                border: "1.5px dashed var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                background: "#fff",
              }}
            >
              <span style={{ color: "var(--coral)", fontSize: "18px" }}>＋</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--coral)" }}>Add child profile</span>
            </div>
          ) : (
            <form
              onSubmit={handleAddChild}
              style={{
                background: "#fff",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: "900" }}>Add child profile</span>
                <button
                  onClick={() => setShowChildForm(false)}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--ink3)" }}
                >
                  ×
                </button>
              </div>
              <div className="field">
                <label>Child name</label>
                <input className="inp" placeholder="e.g. Aanya" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Age (yrs)</label>
                  <input className="inp" type="number" min="0" max="14" placeholder="e.g. 5" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
                </div>
                <div className="field">
                  <label>Height (cm) - Optional</label>
                  <input className="inp" type="number" placeholder="e.g. 110" value={childHeight} onChange={(e) => setChildHeight(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary btn-sm" type="submit" style={{ marginTop: "6px" }}>
                Save profile
              </button>
            </form>
          )}
        </div>

        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--ink)", marginBottom: "14px" }}>
            Saved Addresses
          </div>
          {user.addresses?.map((addr) => (
            <div className="card" style={{ padding: "14px", textAlign: "left", marginBottom: "10px" }} key={addr.id}>
              <div style={{ fontWeight: 700, color: "var(--coral-d)", fontSize: "13px", marginBottom: "4px" }}>
                {addr.type === "Home" ? "🏠 Home" : addr.type === "Office" ? "🏢 Office" : "📍 Other"}{" "}
                {addr.isDefault && <span className="pill p-c">Default</span>}
              </div>
              <div style={{ fontSize: "12px", color: "var(--ink2)", lineHeight: "1.6" }}>
                {addr.name} · {addr.phone}
                <br />
                {addr.address}, {addr.city} – {addr.pincode}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "36px" }}>
        <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)", marginBottom: "18px" }}>
          Your Orders ({orders.length})
        </div>

        {ordersLoading ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "40px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📦</div>
            <div style={{ fontWeight: "bold" }}>No orders placed yet</div>
            <Link href="/shop" style={{ color: "var(--coral)", fontSize: "13px", display: "inline-block", marginTop: "8px", fontWeight: "600" }}>
              Explore styles →
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              const statusLine = ord.status;
              const isConfirmed = true;
              const isShipped = statusLine === "Shipped" || statusLine === "Delivered";
              const isDelivered = statusLine === "Delivered";

              return (
                <div
                  className="card"
                  style={{ padding: "18px", marginBottom: "14px", textAlign: "left", cursor: "pointer" }}
                  key={ord.id}
                  onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Order ID</div>
                      <div style={{ fontSize: "14px", fontWeight: "800" }}>#{ord.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Placed on</div>
                      <div style={{ fontSize: "13px", color: "var(--ink)" }}>
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Total amount</div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--coral)" }}>
                        ₹{ord.total.toLocaleString()}
                      </div>
                    </div>
                    <span className={`pill ${ord.status === "Delivered" ? "p-g" : "p-c"}`} style={{ alignSelf: "center" }}>
                      {ord.status}
                    </span>
                  </div>

                  {!isExpanded && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {ord.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              width: "36px",
                              height: "36px",
                              background: item.bg || "var(--bg)",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                            }}
                          >
                            {item.emoji}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink3)", marginLeft: "auto" }}>
                        Tap to expand timeline &amp; details
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "14px" }}>Order status timeline</div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div className="track-step">
                          <div
                            className="track-dot"
                            style={{ background: isConfirmed ? "var(--green)" : "var(--border)" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: "700" }}>Order Confirmed</div>
                            <div style={{ fontSize: "10px", color: "var(--ink3)" }}>Your order is accepted and being packed</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", paddingLeft: "6px" }}>
                          <div className={`track-line-v ${isShipped ? "done" : ""}`} />
                        </div>

                        <div className="track-step">
                          <div
                            className="track-dot"
                            style={{ background: isShipped ? "var(--green)" : "var(--border)" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: "700" }}>Shipped</div>
                            <div style={{ fontSize: "10px", color: "var(--ink3)" }}>Handed over to carrier partner</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", paddingLeft: "6px" }}>
                          <div className={`track-line-v ${isDelivered ? "done" : ""}`} />
                        </div>

                        <div className="track-step">
                          <div
                            className="track-dot"
                            style={{ background: isDelivered ? "var(--green)" : "var(--border)" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: "700" }}>Delivered</div>
                            <div style={{ fontSize: "10px", color: "var(--ink3)" }}>Order arrived at your doorstep</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>Ordered items</div>
                        {ord.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 0",
                              borderBottom: "1px dashed var(--border)",
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                background: item.bg,
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                              }}
                            >
                              {item.emoji}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: "700" }}>{item.name}</div>
                              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>
                                Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                              </div>
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                              ₹{(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px", fontSize: "12px", color: "var(--ink2)" }}>
                        <span>Estimated delivery: <strong>{ord.estDelivery}</strong></span>
                        <span style={{ cursor: "pointer", color: "var(--coral)", fontWeight: "bold" }} onClick={() => setExpandedOrderId(null)}>
                          Minimize ▲
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
