import React from "react";
import prisma from "@/app/lib/prisma";
import ProductClient from "./ProductClient";

export const revalidate = 60; // Cache PDP for up to 60 seconds

export default async function ProductPage({ params }) {
  // Resolve params
  const { id } = await params;

  let product = null;
  let completeLook = [];

  try {
    product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        sizes: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (product) {
      completeLook = await prisma.product.findMany({
        where: {
          NOT: { id: product.id },
        },
        take: 4,
      });
    }
  } catch (err) {
    console.error("Database fetch failed on Product PDP page:", err);
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "14px" }}>👕</div>
        <h2>Product not found</h2>
        <p style={{ color: "var(--ink3)", marginTop: "8px" }}>The product you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <ProductClient
      product={product}
      completeLook={completeLook}
    />
  );
}
