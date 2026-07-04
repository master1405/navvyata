import prisma from "@/app/lib/prisma";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupons = await prisma.coupon.findMany({
      orderBy: { code: "asc" },
    });
    return Response.json({ success: true, coupons });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || (admin.role !== "Owner" && admin.role !== "Manager")) {
      return Response.json({ error: "Forbidden: Owner or Manager role required" }, { status: 403 });
    }

    const { code, discountPct, discountAmt, minOrderVal } = await req.json();

    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Check if coupon already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return Response.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPct: discountPct ? parseInt(discountPct) : null,
        discountAmt: discountAmt ? parseInt(discountAmt) : null,
        minOrderVal: minOrderVal ? parseInt(minOrderVal) : 0,
        active: true,
      },
    });

    return Response.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || (admin.role !== "Owner" && admin.role !== "Manager")) {
      return Response.json({ error: "Forbidden: Owner or Manager role required" }, { status: 403 });
    }

    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { code: code.toUpperCase() },
    });

    return Response.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
