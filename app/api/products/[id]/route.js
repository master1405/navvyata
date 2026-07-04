import prisma from "@/app/lib/prisma";

export async function GET(req, { params }) {
  try {
    // Resolve params
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { sizes: true, reviews: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}
