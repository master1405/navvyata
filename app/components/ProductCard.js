"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    // Default to first size if available, otherwise 'Standard'
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].size : "Standard";
    addToCart(product, defaultSize, "Default");
  };

  const isWished = wishlist.some((item) => item.id === product.id);

  return (
    <div className="pcard" onClick={handleCardClick}>
      <div className="pimg">
        <div className="pimg-inner" style={{ background: product.bg }}>
          {product.emoji}
          {product.tag && (
            <span className={`pill ${product.tagClass || "p-c"} pcard-pill`}>
              {product.tag}
            </span>
          )}
          <button className="pcard-wish" onClick={handleWishlistClick}>
            {isWished ? "❤️" : "🤍"}
          </button>
          <button className="pcard-hover-btn" onClick={handleQuickAddClick}>
            + Quick add to cart
          </button>
        </div>
      </div>
      <div className="pbody">
        <div className="pcard-name">{product.name}</div>
        <div className="pcard-age">{product.ageRange}</div>
        <div className="pcard-foot">
          <div>
            <span className="pcard-price">₹{product.price}</span>
            {product.oldPrice && (
              <span className="pcard-old">₹{product.oldPrice}</span>
            )}
          </div>
          <span className="pcard-stars">★★★★★</span>
        </div>
      </div>
    </div>
  );
}
