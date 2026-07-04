"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { showToast } = useCart();

  const handleJoin = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast("🎉 Welcome! Check email for NAVVY10");
      setEmail("");
    } else {
      showToast("⚠️ Please enter a valid email address");
    }
  };

  return (
    <form className="nl-form" onSubmit={handleJoin}>
      <input
        className="inp"
        type="email"
        placeholder="your@email.com"
        style={{ borderRadius: "50px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Join
      </button>
    </form>
  );
}
