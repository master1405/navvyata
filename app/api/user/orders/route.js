import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch order history" }, { status: 500 });
  }
}
