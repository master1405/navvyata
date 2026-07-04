import prisma from "@/app/lib/prisma";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Calculate sales metrics (Exclude pending checkout orders)
    const salesAggregate = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        status: { not: "Pending" },
      },
    });

    const totalSales = salesAggregate._sum.total || 0;
    const totalOrders = salesAggregate._count.id || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // 2. Customers count
    const totalCustomers = await prisma.user.count();

    // 3. Low stock alerts (items with stock <= 3)
    const lowStockAlerts = await prisma.productSizeStock.findMany({
      where: {
        stock: { lte: 3 },
      },
      include: {
        product: {
          select: { name: true, emoji: true },
        },
      },
      take: 8,
    });

    return Response.json({
      success: true,
      metrics: {
        totalSales,
        totalOrders,
        avgOrderValue,
        totalCustomers,
        lowStockAlerts: lowStockAlerts.map((ls) => ({
          id: ls.id,
          productName: ls.product.name,
          emoji: ls.product.emoji,
          size: ls.size,
          stock: ls.stock,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch metrics summary" }, { status: 500 });
  }
}
