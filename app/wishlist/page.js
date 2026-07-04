"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductCard from "@/app/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <div id="s-wishlist" className="section page-body" style={{ textAlign: "left" }}>
      <div className="sec-head">
        <div>
          <div className="sec-title">Wishlist</div>
          <div className="sec-sub">{wishlist.length} saved items</div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "56px 20px",
            background: "#fff",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "14px" }}>🤍</div>
          <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Your wishlist is empty</div>
          <div style={{ fontSize: "13px", color: "var(--ink3)", marginBottom: "22px" }}>
            Tap the heart icon on any style to save it here!
          </div>
          <Link href="/shop">
            <button className="btn btn-primary">Start shopping</button>
          </Link>
        </div>
      ) : (
        <div className="grid-4" id="wish-grid">
          {wishlist.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
