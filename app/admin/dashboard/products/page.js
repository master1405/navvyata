"use client";

import React, { useState, useEffect } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successFeedback, setSuccessFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");
  
  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // Null for new product, otherwise ID
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [bg, setBg] = useState("var(--coral-l)");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [ageRange, setAgeRange] = useState("4–8 yrs");
  const [isFeatured, setIsFeatured] = useState(false);
  const [tag, setTag] = useState("");
  const [tagClass, setTagClass] = useState("p-c");
  const [description, setDescription] = useState("");
  
  // Sizes stocks array
  const [sizesInput, setSizesInput] = useState([
    { size: "3–4Y", stock: 10 },
    { size: "4–5Y", stock: 10 },
    { size: "5–6Y", stock: 10 },
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const triggerFeedback = (type, message) => {
    if (type === "success") {
      setSuccessFeedback(message);
      setErrorFeedback("");
      setTimeout(() => setSuccessFeedback(""), 3000);
    } else {
      setErrorFeedback(message);
      setSuccessFeedback("");
      setTimeout(() => setErrorFeedback(""), 4000);
    }
  };

  const handleOpenNewModal = () => {
    setEditId(null);
    setName("");
    setEmoji("👕");
    setBg("var(--coral-l)");
    setPrice("");
    setOldPrice("");
    setAgeRange("4–8 yrs");
    setIsFeatured(false);
    setTag("");
    setTagClass("p-c");
    setDescription("");
    setSizesInput([
      { size: "3–4Y", stock: 10 },
      { size: "4–5Y", stock: 10 },
      { size: "5–6Y", stock: 10 },
    ]);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditId(prod.id);
    setName(prod.name);
    setEmoji(prod.emoji);
    setBg(prod.bg);
    setPrice(prod.price.toString());
    setOldPrice(prod.oldPrice ? prod.oldPrice.toString() : "");
    setAgeRange(prod.ageRange);
    setIsFeatured(prod.isFeatured);
    setTag(prod.tag || "");
    setTagClass(prod.tagClass || "p-c");
    setDescription(prod.description || "");
    
    const mappedSizes = prod.sizes && prod.sizes.length > 0
      ? prod.sizes.map((sz) => ({ size: sz.size, stock: sz.stock }))
      : [{ size: "Standard", stock: 10 }];
    setSizesInput(mappedSizes);
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !emoji.trim() || !bg.trim() || !price || !ageRange) {
      triggerFeedback("error", "Please fill out all required fields!");
      return;
    }

    const payload = {
      name,
      emoji,
      bg,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      ageRange,
      isFeatured,
      tag: tag.trim() || null,
      tagClass,
      description,
      sizes: sizesInput,
    };

    const isEdit = editId !== null;
    if (isEdit) {
      payload.id = editId;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        triggerFeedback("success", isEdit ? "Product updated!" : "Product created!");
        loadProducts();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to save product");
      }
    } catch (err) {
      triggerFeedback("error", "An error occurred while saving the product");
    }
  };

  const handleDeleteProduct = async (id, productName) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        triggerFeedback("success", `Product ${productName} removed`);
        setConfirmDeleteId(null);
        loadProducts();
      } else {
        const errData = await res.json();
        triggerFeedback("error", errData.error || "Failed to delete product");
      }
    } catch (err) {
      triggerFeedback("error", "Error occurred deleting product");
    }
  };

  const handleSizeStockChange = (index, field, value) => {
    const updated = [...sizesInput];
    if (field === "stock") {
      updated[index][field] = parseInt(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setSizesInput(updated);
  };

  const handleAddSizeRow = () => {
    setSizesInput([...sizesInput, { size: "6–7Y", stock: 10 }]);
  };

  const handleRemoveSizeRow = (index) => {
    setSizesInput(sizesInput.filter((_, idx) => idx !== index));
  };

  return (
    <div style={{ textAlign: "left" }}>
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0 }}>👕 Products Catalog</h2>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Manage catalog items, prices, and stock inventory</p>
        </div>
        <button
          onClick={handleOpenNewModal}
          style={{
            background: "var(--coral)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ＋ Add Product
        </button>
      </div>

      {/* Feedback Alerts */}
      {successFeedback && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", color: "#34D399", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ✅ {successFeedback}
        </div>
      )}
      {errorFeedback && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#F87171", padding: "10px 14px", fontSize: "13px", marginBottom: "18px" }}>
          ⚠️ {errorFeedback}
        </div>
      )}

      {/* Grid of Catalog */}
      {loading ? (
        <div style={{ color: "#94A3B8" }}>Loading products catalog...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: "40px", background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", textAlign: "center", color: "#94A3B8" }}>
          No products in catalog. Add one above!
        </div>
      ) : (
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#334155", borderBottom: "1.5px solid #475569" }}>
                  <th style={{ padding: "12px 16px", color: "#E2E8F0", textAlign: "left" }}>Product</th>
                  <th style={{ padding: "12px 16px", color: "#E2E8F0" }}>Age</th>
                  <th style={{ padding: "12px 16px", color: "#E2E8F0" }}>Price</th>
                  <th style={{ padding: "12px 16px", color: "#E2E8F0" }}>Inventory stocks</th>
                  <th style={{ padding: "12px 16px", color: "#E2E8F0", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  return (
                    <tr key={prod.id} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", background: prod.bg, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                          {prod.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#fff" }}>{prod.name}</div>
                          {prod.tag && <span className={`pill ${prod.tagClass || "p-c"}`} style={{ fontSize: "9px", padding: "1px 5px" }}>{prod.tag}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#E2E8F0", textAlign: "center" }}>{prod.ageRange}</td>
                      <td style={{ padding: "14px 16px", color: "#E2E8F0", textAlign: "center" }}>
                        <strong>₹{prod.price}</strong>
                        {prod.oldPrice && <span style={{ textDecoration: "line-through", color: "#64748B", fontSize: "11px", marginLeft: "6px" }}>₹{prod.oldPrice}</span>}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#E2E8F0", textAlign: "center" }}>
                        {prod.sizes?.map((sz) => (
                          <span
                            key={sz.id}
                            style={{
                              display: "inline-block",
                              background: sz.stock <= 3 ? "rgba(239, 68, 68, 0.15)" : "#0F172A",
                              color: sz.stock <= 3 ? "#EF4444" : "#94A3B8",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              margin: "2px",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            {sz.size}: {sz.stock}
                          </span>
                        )) || "0 sizes"}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {confirmDeleteId === prod.id ? (
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", marginRight: "12px", fontWeight: "700" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(prod.id)}
                              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontWeight: "700" }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Product Modal dialog */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#1E293B",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              border: "1px solid #334155",
              maxHeight: "90vh",
              overflowY: "auto",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#fff", margin: 0 }}>
                {editId ? "✏️ Edit Product" : "✨ Create New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>NAME *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Fox Print Romper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>EMOJI *</label>
                  <input
                    className="inp"
                    placeholder="e.g. 👕"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    required
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", textAlign: "center" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>PRICE (₹) *</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g. 599"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>OLD PRICE (₹)</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g. 799"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>BACKGROUND COLOR *</label>
                  <input
                    className="inp"
                    placeholder="e.g. var(--coral-l)"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    required
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>AGE RANGE *</label>
                  <input
                    className="inp"
                    placeholder="e.g. 0-12m or 3–7 yrs"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    required
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>PILL TAG (OPTIONAL)</label>
                  <input
                    className="inp"
                    placeholder="e.g. Sale or New"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>TAG CLASS</label>
                  <select
                    value={tagClass}
                    onChange={(e) => setTagClass(e.target.value)}
                    style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="p-c">Coral Badge (Sale)</option>
                    <option value="p-g">Teal Badge (Eco)</option>
                    <option value="p-w">Yellow Badge (New)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label style={{ fontSize: "12px", color: "#fff", cursor: "pointer" }}>Featured Product (Home Bestsellers)</label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>DESCRIPTION</label>
                <textarea
                  className="inp"
                  placeholder="Fabric and details details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", height: "60px", resize: "none" }}
                />
              </div>

              {/* Sizes stock rows lists */}
              <div style={{ borderTop: "1px solid #334155", paddingTop: "14px", marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>SIZES &amp; INVENTORY STOCKS</span>
                  <button
                    type="button"
                    onClick={handleAddSizeRow}
                    style={{ background: "none", border: "none", color: "var(--teal)", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    ＋ Add size
                  </button>
                </div>

                {sizesInput.map((row, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      placeholder="Size e.g. 4Y"
                      value={row.size}
                      onChange={(e) => handleSizeStockChange(idx, "size", e.target.value)}
                      required
                      style={{ flex: 2, background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <input
                      placeholder="Stock quantity"
                      type="number"
                      value={row.stock}
                      onChange={(e) => handleSizeStockChange(idx, "stock", e.target.value)}
                      required
                      style={{ flex: 1, background: "#0F172A", border: "1.5px solid #334155", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px" }}
                    />
                    {sizesInput.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeRow(idx)}
                        style={{ background: "none", border: "none", color: "#EF4444", fontSize: "18px", cursor: "pointer" }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                style={{
                  background: "var(--teal)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                {editId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
