"use client";

import React, { Suspense } from "react";
import AccountClient from "./AccountClient";

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "80px" }}>Loading account profile...</div>}>
      <AccountClient />
    </Suspense>
  );
}
