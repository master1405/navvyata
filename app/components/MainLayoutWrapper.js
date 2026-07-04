"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    cart,
    wishlist,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    lastAddedItem,
    toast,
    getCartSubtotal,
    getCartTotal,
    updateCartQty,
    removeFromCart,
  } = useCart();

  const [timerText, setTimerText] = useState("02:14:33");
  const [searchQuery, setSearchQuery] = useState("");
  const [spText, setSpText] = useState("Priya from Pune just bought Lion Safari Tee (4–5Y)");

  // Sync search input with router
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Static countdown timer implementation
  useEffect(() => {
    let secondsLeft = 8073;
    const interval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft < 0) secondsLeft = 86400;
      const h = Math.floor(secondsLeft / 3600).toString().padStart(2, "0");
      const m = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, "0");
      const s = (secondsLeft % 60).toString().padStart(2, "0");
      setTimerText(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Social proof ticker notifications rotation
  useEffect(() => {
    const spMsgs = [
      "Priya from Pune just bought Lion Safari Tee (4–5Y)",
      "Rahul from Delhi added Sparkle Joggers to cart",
      "Sneha from Mumbai just bought Fox Print Romper (0–6M)",
      "Ananya from Bangalore bought Floral Summer Dress (3–4Y)",
      "47 people bought from Navvyata in the last 2 hours",
      "Kavita from Hyderabad just bought Space Explorer Set",
      "Meera from Chennai added 3 items to cart",
      "Raj from Nagpur just bought Ocean Shorts (5–6Y)",
    ];
    let spIdx = 0;
    const interval = setInterval(() => {
      spIdx = (spIdx + 1) % spMsgs.length;
      setSpText(spMsgs[spIdx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const isSplashPage = pathname === "/splash"; // if we have a mobile splash screen page
  
  // Upsell list for slide drawer
  const upsells = [
    { emoji: "🧢", name: "Fun Cap", price: 299, bg: "var(--sun-l)" },
    { emoji: "🩳", name: "Denim Shorts", price: 449, bg: "var(--teal-l)" },
  ];

  return (
    <>
      {/* Toast Notification */}
      <div id="toast" className={toast.open ? "show" : ""}>
        <span id="tmsg">{toast.message}</span>
      </div>

      {/* Cart Drawer sliding overlay */}
      <div
        className={`overlay right-panel ${isCartDrawerOpen ? "open" : ""}`}
        id="cdrawer"
        onClick={() => setIsCartDrawerOpen(false)}
        style={{ display: isCartDrawerOpen ? "flex" : "none" }}
      >
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle"></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)" }}>Added to cart 🛍️</div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--ink3)", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {lastAddedItem && (
            <div style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "14px", display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
              <div
                id="dimg"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  flexShrink: 0,
                  background: lastAddedItem.bg,
                }}
              >
                {lastAddedItem.emoji}
              </div>
              <div style={{ textAlign: "left" }}>
                <div id="dname" style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)" }}>{lastAddedItem.name}</div>
                <div id="dmeta" style={{ fontSize: "12px", color: "var(--ink3)", margin: "2px 0 4px" }}>
                  {lastAddedItem.size} · {lastAddedItem.color}
                </div>
                <div id="dprice" style={{ fontSize: "16px", fontWeight: "800", color: "var(--coral)" }}>₹{lastAddedItem.price}</div>
              </div>
            </div>
          )}

          {/* Shipping logic banner */}
          {getCartSubtotal() < 999 ? (
            <div id="dship" style={{ background: "var(--teal-l)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: "12px", color: "var(--teal-d)", fontWeight: "600", marginBottom: "16px" }}>
              🚚 Add ₹{999 - getCartSubtotal()} more for free shipping
            </div>
          ) : (
            <div id="dship" style={{ background: "var(--green-l)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: "12px", color: "var(--green-d)", fontWeight: "600", marginBottom: "16px" }}>
              🎉 Free shipping unlocked!
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setIsCartDrawerOpen(false)}>
              Continue shopping
            </button>
            <Link href="/cart" style={{ flex: 1 }} onClick={() => setIsCartDrawerOpen(false)}>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                Go to cart →
              </button>
            </Link>
          </div>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)", textAlign: "left" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "12px" }}>You might also like</div>
            <div id="drawer-upsell">
              {upsells.map((u, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "var(--radius)",
                    marginBottom: "6px",
                    transition: "background .15s",
                  }}
                  onClick={() => {
                    const mockProduct = {
                      id: 99 + i,
                      emoji: u.emoji,
                      name: u.name,
                      price: u.price,
                      bg: u.bg,
                    };
                    const { addToCart } = useCart(); // fetch dynamic add context
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      background: u.bg,
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {u.emoji}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)" }}>{u.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--coral)", fontWeight: "700" }}>₹{u.price}</div>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--coral)", fontWeight: "700" }}>+ Add</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout chrome wrapper */}
      {!isSplashPage && (
        <>
          {/* Announcement Bar */}
          <div id="ann-bar">
            🎉 Free shipping above <span>₹999</span> · Code <span>NAVVY20</span> for 20% off · Ends in <span id="timer">{timerText}</span>
          </div>

          {/* Header Navigation */}
          <nav id="navbar">
            <div className="nav-inner">
              <Link href="/" className="nav-logo">
                navvy<em>ata</em>
              </Link>
              
              <div className="nav-links">
                <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
                <Link href="/shop" className={pathname.startsWith("/shop") ? "active" : ""}>Shop all</Link>
                <Link href="/shop?filter=new" className={pathname.includes("filter=new") ? "active" : ""}>New arrivals</Link>
                <Link href="/shop?filter=sale" className={pathname.includes("filter=sale") ? "active" : ""}>Sale</Link>
                <Link href="/blog" className={pathname.startsWith("/blog") ? "active" : ""}>Blog</Link>
                <Link href="/about" className={pathname === "/about" ? "active" : ""}>About</Link>
              </div>

              <div className="nav-search-wrap">
                <span className="sico">🔍</span>
                <input
                  placeholder="Search clothes, brands…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>

              <div className="nav-actions">
                <Link href="/search" className="nav-ic" id="mob-search-btn" title="Search">
                  🔍
                </Link>
                <Link href="/wishlist" className="nav-ic" title="Wishlist">
                  🤍
                </Link>
                <Link href="/account" className="nav-ic" title="Account">
                  👤
                </Link>
                <Link href="/cart" className="nav-ic" title="Cart" style={{ position: "relative" }}>
                  🛍️
                  {totalCartQty > 0 && (
                    <span className="nav-bdg" style={{ display: "flex" }}>
                      {totalCartQty}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </nav>

          {/* Social Proof Message (Shown on Home Route) */}
          {pathname === "/" && (
            <div id="sp-ticker" style={{ backgroundColor: "var(--coral-l)", borderBottom: "1px solid var(--border)", padding: "10px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🟢</span>
              <div id="sp-msg" style={{ fontSize: "12px", color: "var(--coral-d)", fontWeight: "600", transition: "opacity .4s" }}>
                {spText}
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Page Content */}
      <main style={{ minHeight: "calc(100vh - 250px)" }}>{children}</main>

      {/* Footer chrome wrapper */}
      {!isSplashPage && (
        <>
          {/* Mobile Bottom Navigation Menu */}
          <div id="bottom-nav">
            <Link href="/" className={`bni ${pathname === "/" ? "on" : ""}`}>
              <div className="bi">🏠</div>
              <div className="bl">Home</div>
            </Link>
            <Link href="/shop" className={`bni ${pathname.startsWith("/shop") ? "on" : ""}`}>
              <div className="bi">🛒</div>
              <div className="bl">Shop</div>
            </Link>
            <Link href="/search" className={`bni ${pathname.startsWith("/search") ? "on" : ""}`}>
              <div className="bi">🔍</div>
              <div className="bl">Search</div>
            </Link>
            <Link href="/cart" className={`bni ${pathname.startsWith("/cart") ? "on" : ""}`} style={{ position: "relative" }}>
              <div className="bi">🛍️</div>
              {totalCartQty > 0 && (
                <span className="nav-bdg" style={{ top: "2px", right: "14px", display: "flex" }}>
                  {totalCartQty}
                </span>
              )}
              <div className="bl">Cart</div>
            </Link>
            <Link href="/account" className={`bni ${pathname.startsWith("/account") ? "on" : ""}`}>
              <div className="bi">👤</div>
              <div className="bl">Account</div>
            </Link>
          </div>

          {/* Desktop Footer Section */}
          <footer id="footer">
            <div className="footer-inner">
              <div className="footer-grid">
                <div>
                  <div className="footer-logo">navvy<em>ata</em></div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,.6)", lineHeight: "1.7", maxWidth: "260px" }}>
                    Bringing joy to childhood, one outfit at a time. Designed for comfort, built to last.
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Shop</h4>
                  <Link href="/shop">Newborns</Link>
                  <Link href="/shop">Toddlers</Link>
                  <Link href="/shop">Kids</Link>
                  <Link href="/shop">Tweens</Link>
                  <Link href="/shop?filter=sale">Sale</Link>
                </div>
                <div className="footer-col">
                  <h4>Help</h4>
                  <Link href="/sizeguide">Size Guide</Link>
                  <Link href="/account">Track Order</Link>
                  <Link href="/help">Returns</Link>
                  <Link href="/help">FAQs</Link>
                </div>
                <div className="footer-col">
                  <h4>Company</h4>
                  <Link href="/about">About Us</Link>
                  <Link href="/blog">Blog</Link>
                  <Link href="/careers">Careers</Link>
                  <Link href="/press">Press</Link>
                </div>
                <div className="footer-col">
                  <h4>Account</h4>
                  <Link href="/account">My Account</Link>
                  <Link href="/wishlist">Wishlist</Link>
                  <Link href="/account">Rewards</Link>
                  <Link href="/account/login">Sign in</Link>
                </div>
              </div>
              <div className="footer-bottom">
                <div>© 2025 Navvyata. Made with ❤️ for little ones everywhere.</div>
                <div className="footer-badges">
                  <span className="fbadge">UPI</span>
                  <span className="fbadge">Visa</span>
                  <span className="fbadge">Mastercard</span>
                  <span className="fbadge">COD</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}
