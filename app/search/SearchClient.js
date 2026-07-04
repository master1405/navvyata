"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products on mount to filter on client
  useEffect(() => {
    async function fetchProducts() {
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
    }
    fetchProducts();
  }, []);

  // Sync state if query URL params change
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Compute matched products
  const matchedProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.ageRange.toLowerCase().includes(q)
    );
  }, [products, query]);

  const trends = ["Lion tee", "Dress", "Joggers", "Romper", "Shorts"];

  return (
    <div className="section page-body" style={{ textAlign: "left" }}>
      <div className="sec-title" style={{ marginBottom: "16px" }}>
        Search
      </div>
      <input
        className="inp"
        id="search-inp"
        placeholder="Search clothes, brands…"
        style={{ marginBottom: "20px", borderRadius: "50px", paddingLeft: "18px" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <div>Loading products...</div>
      ) : query.trim() ? (
        <div id="sres">
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "12px" }}>
            Results for "{query}"
          </div>
          {matchedProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--ink3)", fontSize: "14px" }}>
              😕 No results found for "{query}"
            </div>
          ) : (
            <div className="grid-4">
              {matchedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div id="sdef">
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "12px" }}>
            Trending Searches
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {trends.map((t) => (
              <div key={t} className="chip" onClick={() => setQuery(t)}>
                {t}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "12px" }}>
            Categories
          </div>
          <div className="grid-4">
            <Link href="/shop" className="bcard">
              <div className="bcard-img" style={{ background: "var(--coral-l)", height: "100px", fontSize: "36px" }}>
                👕
              </div>
              <div className="bcard-body">
                <div className="bcard-title" style={{ fontSize: "13px" }}>
                  Tops &amp; Tees
                </div>
                <div className="bcard-meta">124 items</div>
              </div>
            </Link>
            <Link href="/shop" className="bcard">
              <div className="bcard-img" style={{ background: "var(--teal-l)", height: "100px", fontSize: "36px" }}>
                👗
              </div>
              <div className="bcard-body">
                <div className="bcard-title" style={{ fontSize: "13px" }}>
                  Dresses
                </div>
                <div className="bcard-meta">87 items</div>
              </div>
            </Link>
            <Link href="/shop" className="bcard">
              <div className="bcard-img" style={{ background: "var(--sun-l)", height: "100px", fontSize: "36px" }}>
                🩳
              </div>
              <div className="bcard-body">
                <div className="bcard-title" style={{ fontSize: "13px" }}>
                  Bottoms
                </div>
                <div className="bcard-meta">96 items</div>
              </div>
            </Link>
            <Link href="/shop" className="bcard">
              <div className="bcard-img" style={{ background: "var(--purple-l)", height: "100px", fontSize: "36px" }}>
                🧥
              </div>
              <div className="bcard-body">
                <div className="bcard-title" style={{ fontSize: "13px" }}>
                  Sets &amp; Combos
                </div>
                <div className="bcard-meta">62 items</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
