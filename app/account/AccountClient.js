"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { INDIAN_STATES, getRecommendedSize } from "@/app/lib/constants";

/**
 * Account Dashboard & Auth Client Component
 * Provides complete customer lifecycle management:
 * 1. Mobile OTP authentication & Google sign-in fallback
 * 2. Rewards ledger balance & redemption instructions
 * 3. Child Profile Management (Add, Edit, Delete, Default assignment)
 * 4. Saved Address Management (Add, Edit, Delete, Default assignment with strict Indian validation)
 * 5. Order History with collapsible visual timeline tracking
 */

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
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  
  // Dashboard states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Child profile modal & form states
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null); // null = create new, number = edit
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childHeight, setChildHeight] = useState("");
  const [childIsDefault, setChildIsDefault] = useState(false);
  const [childSaving, setChildSaving] = useState(false);

  // Address modal & form states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null = create new, number = edit
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrType, setAddrType] = useState("Home");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrErrors, setAddrErrors] = useState({});
  const [addrSaving, setAddrSaving] = useState(false);

  // Inline delete confirmation states (avoids native browser dialog freeze)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // { type: 'address' | 'child', id, title }

  const redirectPath = searchParams.get("redirect") || "";

  // Fetch customer orders when authenticated
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

  // --------------------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // --------------------------------------------------------------------------
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
      setPhone("");
      setOtpDigits(["", "", "", ""]);
      setStep("phone");
      
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

    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // --------------------------------------------------------------------------
  // CHILD PROFILE CRUD HANDLERS
  // --------------------------------------------------------------------------
  const openAddChildModal = () => {
    setEditingChildId(null);
    setChildName("");
    setChildAge("");
    setChildHeight("");
    setChildIsDefault(user.childProfiles?.length === 0);
    setShowChildModal(true);
  };

  const openEditChildModal = (child) => {
    setEditingChildId(child.id);
    setChildName(child.name);
    setChildAge(child.age.toString());
    setChildHeight(child.height ? child.height.toString() : "");
    setChildIsDefault(child.isDefault);
    setShowChildModal(true);
  };

  const handleSaveChildProfile = async (e) => {
    e.preventDefault();
    if (!childName.trim()) {
      showToast("⚠️ Please enter your child's name");
      return;
    }
    if (!childAge.trim() || isNaN(childAge) || parseInt(childAge) < 0 || parseInt(childAge) > 16) {
      showToast("⚠️ Please enter a valid age between 0 and 16 years");
      return;
    }

    setChildSaving(true);
    // Automatically calculate recommended size using pediatric anthropometrics
    const calculatedSize = getRecommendedSize(childAge, childHeight);

    try {
      const isEditing = editingChildId !== null;
      const endpoint = "/api/user/child-profiles";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        name: childName.trim(),
        age: parseInt(childAge),
        height: childHeight ? parseFloat(childHeight) : null,
        size: calculatedSize,
        isDefault: childIsDefault,
      };

      if (isEditing) {
        payload.id = editingChildId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEditing ? "👶 Child profile updated!" : "👶 Child profile added!");
        await refreshUserProfile();
        setShowChildModal(false);
      } else {
        showToast("❌ " + (data.error || "Failed to save profile"));
      }
    } catch (err) {
      showToast("❌ Network error saving profile");
    } finally {
      setChildSaving(false);
    }
  };

  const handleDeleteChildProfile = async (childId) => {
    try {
      const res = await fetch(`/api/user/child-profiles?id=${childId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("🗑️ Child profile removed");
        await refreshUserProfile();
      } else {
        showToast("❌ Failed to delete profile");
      }
    } catch (err) {
      showToast("❌ Error deleting profile");
    } finally {
      setDeleteConfirmTarget(null);
    }
  };

  // --------------------------------------------------------------------------
  // ADDRESS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddrName("");
    setAddrPhone(user.phone || "");
    setAddrLine("");
    setAddrPincode("");
    setAddrCity("");
    setAddrState("");
    setAddrType("Home");
    setAddrIsDefault(user.addresses?.length === 0);
    setAddrErrors({});
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrLine(addr.address);
    setAddrPincode(addr.pincode);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrType(addr.type);
    setAddrIsDefault(addr.isDefault);
    setAddrErrors({});
    setShowAddressModal(true);
  };

  const validateAddressForm = () => {
    const errs = {};
    if (!addrName.trim() || addrName.trim().length < 3) {
      errs.name = "Enter a valid full name (min 3 characters)";
    }
    if (!/^[6-9]\d{9}$/.test(addrPhone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!addrLine.trim() || addrLine.trim().length < 5) {
      errs.line = "Enter complete street address / building details";
    }
    if (!/^[1-9][0-9]{5}$/.test(addrPincode.trim())) {
      errs.pincode = "Enter a valid 6-digit postal pincode";
    }
    if (!addrCity.trim() || addrCity.trim().length < 2) {
      errs.city = "Enter valid city name";
    }
    if (!addrState.trim()) {
      errs.state = "Select state / union territory";
    }
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) {
      showToast("⚠️ Please fix the errors highlighted in the form");
      return;
    }

    setAddrSaving(true);
    try {
      const isEditing = editingAddressId !== null;
      const endpoint = "/api/user/addresses";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        name: addrName.trim(),
        phone: addrPhone.trim(),
        address: addrLine.trim(),
        pincode: addrPincode.trim(),
        city: addrCity.trim(),
        state: addrState.trim(),
        type: addrType,
        isDefault: addrIsDefault,
      };

      if (isEditing) {
        payload.id = editingAddressId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEditing ? "✅ Address updated!" : "✅ Address saved!");
        await refreshUserProfile();
        setShowAddressModal(false);
      } else {
        showToast("❌ " + (data.error || "Failed to save address"));
      }
    } catch (err) {
      showToast("❌ Network error saving address");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("🗑️ Address removed");
        await refreshUserProfile();
      } else {
        showToast("❌ Failed to delete address");
      }
    } catch (err) {
      showToast("❌ Error deleting address");
    } finally {
      setDeleteConfirmTarget(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px" }}>Loading account profile...</div>;
  }

  // --------------------------------------------------------------------------
  // RENDER LOGIN SCREEN (IF GUEST)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // RENDER AUTHENTICATED CUSTOMER DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="account-wrap page-body">
      {/* Header Profile Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2>Account Details</h2>
          <div style={{ color: "var(--ink3)", fontSize: "14px", marginTop: "4px" }}>📱 +91 {user.phone}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={logoutUser}>
          Logout 🚪
        </button>
      </div>

      {/* Rewards Ledger Banner */}
      <Link href="/rewards" style={{ display: "block", background: "linear-gradient(120deg, var(--coral), #FF8E53)", borderRadius: "var(--radius-lg)", padding: "24px 20px", color: "#fff", textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: ".5px" }}>
          Your rewards balance
        </div>
        <div style={{ fontSize: "36px", fontWeight: "900", margin: "6px 0" }}>🌟 {user.coins}</div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Redeem coins in your cart to save ₹{user.coins * 0.1}!</div>
      </Link>

      {/* 2-Column Grid: Kids Profiles & Delivery Addresses */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* COLUMN 1: KIDS PROFILES */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)" }}>
              Kids Profiles ({user.childProfiles?.length || 0})
            </div>
            <button className="btn btn-outline btn-sm" onClick={openAddChildModal} style={{ padding: "6px 12px", fontSize: "12px" }}>
              ＋ Add Child
            </button>
          </div>

          {user.childProfiles?.map((child) => (
            <div className="card" style={{ padding: "16px", marginBottom: "10px", textAlign: "left" }} key={child.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--coral-l)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  👧
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px" }}>{child.name}</span>
                    {child.isDefault && <span className="pill p-c" style={{ fontSize: "10px", padding: "1px 6px" }}>Default</span>}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink3)", marginTop: "2px" }}>
                    {child.age} yrs {child.height ? `· ${child.height} cm` : ""} · Size: <strong style={{ color: "var(--coral-d)" }}>{child.size}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => openEditChildModal(child)}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", fontSize: "12px", color: "var(--ink2)" }}
                    title="Edit profile"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTarget({ type: "child", id: child.id, title: child.name })}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", fontSize: "12px", color: "#e53e3e" }}
                    title="Delete profile"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(!user.childProfiles || user.childProfiles.length === 0) && (
            <div
              onClick={openAddChildModal}
              style={{
                border: "1.5px dashed var(--border)",
                borderRadius: "var(--radius)",
                padding: "20px",
                cursor: "pointer",
                textAlign: "center",
                background: "#fff",
              }}
            >
              <span style={{ color: "var(--coral)", fontSize: "20px", display: "block", marginBottom: "4px" }}>👶</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--coral)" }}>+ Add your child's profile</span>
              <div style={{ fontSize: "11px", color: "var(--ink3)", marginTop: "4px" }}>
                Get automatic size recommendations tailored for growth
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: SAVED ADDRESSES */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)" }}>
              Saved Addresses ({user.addresses?.length || 0})
            </div>
            <button className="btn btn-outline btn-sm" onClick={openAddAddressModal} style={{ padding: "6px 12px", fontSize: "12px" }}>
              ＋ Add Address
            </button>
          </div>

          {user.addresses?.map((addr) => (
            <div className="card" style={{ padding: "16px", textAlign: "left", marginBottom: "10px" }} key={addr.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 700, color: "var(--coral-d)", fontSize: "13px" }}>
                  {addr.type === "Home" ? "🏠 Home" : addr.type === "Office" ? "🏢 Office" : "📍 Other"}{" "}
                  {addr.isDefault && <span className="pill p-c" style={{ fontSize: "10px", padding: "1px 6px" }}>Default</span>}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => openEditAddressModal(addr)}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", fontSize: "12px", color: "var(--ink2)" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTarget({ type: "address", id: addr.id, title: `${addr.type} (${addr.city})` })}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", fontSize: "12px", color: "#e53e3e" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: "1.6" }}>
                <strong>{addr.name}</strong> · +91 {addr.phone}
                <br />
                {addr.address}
                <br />
                {addr.city}, {addr.state} – <strong style={{ color: "var(--ink)" }}>{addr.pincode}</strong>
              </div>
            </div>
          ))}

          {(!user.addresses || user.addresses.length === 0) && (
            <div
              onClick={openAddAddressModal}
              style={{
                border: "1.5px dashed var(--border)",
                borderRadius: "var(--radius)",
                padding: "20px",
                cursor: "pointer",
                textAlign: "center",
                background: "#fff",
              }}
            >
              <span style={{ color: "var(--coral)", fontSize: "20px", display: "block", marginBottom: "4px" }}>📍</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--coral)" }}>+ Add delivery address</span>
              <div style={{ fontSize: "11px", color: "var(--ink3)", marginTop: "4px" }}>
                Speed up checkout with saved addresses
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT CHILD PROFILE */}
      {showChildModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: "24px", width: "100%", maxWidth: "440px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                {editingChildId ? "Edit Child Profile" : "Add Child Profile"}
              </span>
              <button onClick={() => setShowChildModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink3)" }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveChildProfile}>
              <div className="field">
                <label>Child's Name *</label>
                <input
                  className="inp"
                  placeholder="e.g. Aanya"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Age (years) *</label>
                  <input
                    className="inp"
                    type="number"
                    min="0"
                    max="16"
                    placeholder="e.g. 5"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Height (cm) - Optional</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g. 110"
                    value={childHeight}
                    onChange={(e) => setChildHeight(e.target.value)}
                  />
                </div>
              </div>

              {childAge && (
                <div style={{ background: "var(--coral-l)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--coral-d)", marginBottom: "14px", fontWeight: "600" }}>
                  💡 Auto-calculated size: {getRecommendedSize(childAge, childHeight)}
                </div>
              )}

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "18px" }}>
                <input
                  type="checkbox"
                  checked={childIsDefault}
                  onChange={(e) => setChildIsDefault(e.target.checked)}
                />
                <span>Set as active profile for shopping recommendations</span>
              </label>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowChildModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={childSaving}>
                  {childSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ADDRESS */}
      {showAddressModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: "24px", width: "100%", maxWidth: "500px", textAlign: "left", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
              </span>
              <button onClick={() => setShowAddressModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink3)" }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    className={`inp ${addrErrors.name ? "err-border" : ""}`}
                    placeholder="e.g. Priya Sharma"
                    value={addrName}
                    onChange={(e) => {
                      setAddrName(e.target.value);
                      if (addrErrors.name) setAddrErrors((prev) => ({ ...prev, name: null }));
                    }}
                  />
                  {addrErrors.name && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.name}</div>}
                </div>

                <div className="field">
                  <label>Mobile Number *</label>
                  <input
                    className={`inp ${addrErrors.phone ? "err-border" : ""}`}
                    placeholder="10-digit mobile"
                    maxLength="10"
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => {
                      setAddrPhone(e.target.value.replace(/\D/g, ""));
                      if (addrErrors.phone) setAddrErrors((prev) => ({ ...prev, phone: null }));
                    }}
                  />
                  {addrErrors.phone && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.phone}</div>}
                </div>
              </div>

              <div className="field">
                <label>Street Address / Apartment *</label>
                <input
                  className={`inp ${addrErrors.line ? "err-border" : ""}`}
                  placeholder="Flat, House No, Building, Street, Area"
                  value={addrLine}
                  onChange={(e) => {
                    setAddrLine(e.target.value);
                    if (addrErrors.line) setAddrErrors((prev) => ({ ...prev, line: null }));
                  }}
                />
                {addrErrors.line && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.line}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Pincode *</label>
                  <input
                    className={`inp ${addrErrors.pincode ? "err-border" : ""}`}
                    placeholder="6-digit PIN"
                    maxLength="6"
                    value={addrPincode}
                    onChange={(e) => {
                      setAddrPincode(e.target.value.replace(/\D/g, ""));
                      if (addrErrors.pincode) setAddrErrors((prev) => ({ ...prev, pincode: null }));
                    }}
                  />
                  {addrErrors.pincode && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.pincode}</div>}
                </div>

                <div className="field">
                  <label>City *</label>
                  <input
                    className={`inp ${addrErrors.city ? "err-border" : ""}`}
                    placeholder="e.g. Mumbai"
                    value={addrCity}
                    onChange={(e) => {
                      setAddrCity(e.target.value);
                      if (addrErrors.city) setAddrErrors((prev) => ({ ...prev, city: null }));
                    }}
                  />
                  {addrErrors.city && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.city}</div>}
                </div>
              </div>

              <div className="field">
                <label>State / Union Territory *</label>
                <select
                  className={`inp ${addrErrors.state ? "err-border" : ""}`}
                  value={addrState}
                  onChange={(e) => {
                    setAddrState(e.target.value);
                    if (addrErrors.state) setAddrErrors((prev) => ({ ...prev, state: null }));
                  }}
                >
                  <option value="">-- Select State / UT --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {addrErrors.state && <div style={{ color: "#e53e3e", fontSize: "11px", marginTop: "3px" }}>{addrErrors.state}</div>}
              </div>

              <div className="field">
                <label>Address Type</label>
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

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "18px" }}>
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                />
                <span>Set as default shipping address</span>
              </label>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={addrSaving}>
                  {addrSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION (REPLACES NATIVE BROWSER CONFIRM) */}
      {deleteConfirmTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: "24px", maxWidth: "380px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>Confirm Deletion</div>
            <div style={{ fontSize: "13px", color: "var(--ink2)", marginBottom: "20px" }}>
              Are you sure you want to delete <strong>"{deleteConfirmTarget.title}"</strong>? This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirmTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ background: "#e53e3e", borderColor: "#e53e3e" }}
                onClick={() => {
                  if (deleteConfirmTarget.type === "address") {
                    handleDeleteAddress(deleteConfirmTarget.id);
                  } else {
                    handleDeleteChildProfile(deleteConfirmTarget.id);
                  }
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY SECTION */}
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
