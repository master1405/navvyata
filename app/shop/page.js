import React from "react";
import prisma from "@/app/lib/prisma";
import ShopClient from "./ShopClient";

export const revalidate = 60; // Cache PLP for up to 60 seconds

export default async function ShopPage({ searchParams }) {
  // Resolve searchParams on the server
  const params = await searchParams;
  const filter = params.filter || "";
  const age = params.age || "";
  const category = params.category || "";

  let products = [];
  try {
    products = await prisma.product.findMany({
      include: { sizes: true },
    });
  } catch (err) {
    console.error("Database fetch failed on Shop PLP:", err);
  }

  return (
    <ShopClient
      initialProducts={products}
      filterParam={filter}
      ageParam={age}
      categoryParam={category}
    />
  );
}
