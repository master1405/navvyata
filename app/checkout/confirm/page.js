"use client";

import React, { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "80px" }}>Loading confirmation details...</div>}>
      <ConfirmClient />
    </Suspense>
  );
}
