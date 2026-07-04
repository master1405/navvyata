import prisma from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return Response.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    return Response.json({
      success: true,
      code: coupon.code,
      discountPct: coupon.discountPct,
      discountAmt: coupon.discountAmt,
      minOrderVal: coupon.minOrderVal,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
