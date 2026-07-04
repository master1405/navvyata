import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      addressId,
      shippingMethod,
      paymentMethod,
      cartItems,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      coinsRedeemed,
    } = await req.json();

    if (!addressId || !cartItems || cartItems.length === 0) {
      return Response.json({ error: "Invalid order parameters" }, { status: 400 });
    }

    // Retrieve address details to store as a snapshot text
    const addr = user.addresses.find((a) => a.id === addressId);
    if (!addr) {
      return Response.json({ error: "Shipping address not found" }, { status: 404 });
    }

    const addressText = `${addr.address}, ${addr.city}, ${addr.state} – ${addr.pincode}`;

    // Calculate delivery date estimation
    const d3 = new Date();
    d3.setDate(d3.getDate() + 3);
    const d5 = new Date();
    d5.setDate(d5.getDate() + 5);
    const estStr = `${d3.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d5.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })}`;

    // Generate Order ID (Format: NVY-2025-[random 5-digit number])
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderId = `NVY-2025-${randomDigits}`;

    // Set order status based on payment method
    // Cash on Delivery orders can be marked Confirmed immediately
    const initialStatus = paymentMethod === "COD" ? "Confirmed" : "Pending";

    // Create database order transaction
    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        userId: user.id,
        status: initialStatus,
        subtotal,
        discount,
        shipping,
        total,
        payMethod: paymentMethod,
        addressName: addr.name,
        addressText,
        estDelivery: estStr,
        items: {
          create: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            emoji: item.emoji,
            size: item.size,
            color: item.color,
            price: item.price,
            qty: item.qty,
            bg: item.bg,
          })),
        },
      },
    });

    // If COD, run immediate post-payment logic (stock adjustments & coins adjustments)
    if (paymentMethod === "COD") {
      // 1. Deduct stock levels
      for (const item of cartItems) {
        const sizeStock = await prisma.productSizeStock.findFirst({
          where: { productId: item.id, size: item.size },
        });
        if (sizeStock) {
          await prisma.productSizeStock.update({
            where: { id: sizeStock.id },
            data: { stock: Math.max(0, sizeStock.stock - item.qty) },
          });
        }
      }

      // 2. Adjust coins balance
      let finalCoins = user.coins;
      if (coinsRedeemed > 0) {
        finalCoins = Math.max(0, finalCoins - coinsRedeemed);
      }
      // Add coins for total spent (1 coin per ₹10 total spent)
      const earnedCoins = Math.floor(total / 10);
      finalCoins += earnedCoins;

      await prisma.user.update({
        where: { id: user.id },
        data: { coins: finalCoins },
      });
    }

    return Response.json({ success: true, orderId: newOrder.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
