"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Layout UI states
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "" });
  
  // Coupon and rewards coin states
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPct }
  const [redeemedCoins, setRedeemedCoins] = useState(0);

  // Sync state with local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("nvy_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem("nvy_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    // Check user session
    checkSession();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("nvy_cart", JSON.stringify(cart));
  }, [cart]);

  // Save wishlist to local storage
  useEffect(() => {
    localStorage.setItem("nvy_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message) => {
    setToast({ open: true, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2800);
  };

  const checkSession = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Session check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (phone, otp) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        showToast("✅ Login successful!");
        return true;
      } else {
        showToast("❌ " + (data.error || "Login failed"));
        return false;
      }
    } catch (err) {
      showToast("❌ Error logging in");
      console.error(err);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setRedeemedCoins(0);
      setAppliedCoupon(null);
      showToast("✅ Logged out successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const refreshUserProfile = async () => {
    await checkSession();
  };

  const addToCart = (product, size, color) => {
    const itemKey = `${product.name}-${size}-${color}`;
    const priceAmount = product.price;

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (i) => i.name === product.name && i.size === size && i.color === color
      );

      if (existingItem) {
        return prevCart.map((i) =>
          i.name === product.name && i.size === size && i.color === color
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            emoji: product.emoji,
            name: product.name,
            size: size || "Standard",
            color: color || "Default",
            price: priceAmount,
            bg: product.bg,
            qty: 1,
          },
        ];
      }
    });

    setLastAddedItem({
      emoji: product.emoji,
      name: product.name,
      size: size || "Standard",
      color: color || "Default",
      price: priceAmount,
      bg: product.bg,
    });
    setIsCartDrawerOpen(true);
  };

  const updateCartQty = (index, delta) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (!item) return prevCart;

      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prevCart.filter((_, i) => i !== index);
      } else {
        return prevCart.map((i, idx) =>
          idx === index ? { ...i, qty: newQty } : i
        );
      }
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        showToast("💔 Removed from wishlist");
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        showToast("❤️ Added to wishlist!");
        return [...prevWishlist, product];
      }
    });
  };

  const applyCouponCode = async (code) => {
    try {
      const res = await fetch("/api/orders/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({ code, discountPct: data.discountPct });
        showToast("🎁 Coupon applied!");
        return true;
      } else {
        showToast("❌ " + (data.error || "Invalid coupon code"));
        return false;
      }
    } catch (err) {
      showToast("❌ Error applying coupon");
      return false;
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getCartDiscount = () => {
    const subtotal = getCartSubtotal();
    let discount = 0;
    
    // Apply coupon percentage discount
    if (appliedCoupon) {
      discount += (subtotal * appliedCoupon.discountPct) / 100;
    }

    // Apply redeemed coin discount (1 coin = 0.1 rupee)
    if (redeemedCoins > 0) {
      discount += redeemedCoins * 0.1;
    }

    return Math.min(discount, subtotal);
  };

  const getShippingCharge = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0 || subtotal >= 999) return 0;
    return 99; // Standard shipping under 999
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const shipping = getShippingCharge();
    return Math.max(0, subtotal - discount + shipping);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        wishlist,
        user,
        setUser,
        loading,
        loginUser,
        logoutUser,
        refreshUserProfile,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        
        // Layout UX States
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
        toast,
        showToast,

        // Financials & Coupons
        appliedCoupon,
        applyCouponCode,
        clearCoupon,
        redeemedCoins,
        setRedeemedCoins,
        getCartSubtotal,
        getCartDiscount,
        getShippingCharge,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
