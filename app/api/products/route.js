import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { sizes: true, reviews: true },
    });
    return Response.json(products);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
