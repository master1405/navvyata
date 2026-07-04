"use client";

import React, { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <div id="s-search">
      <Suspense fallback={<div style={{ textAlign: "center", padding: "80px" }}>Loading search filters...</div>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
