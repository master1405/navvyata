import prisma from "@/app/lib/prisma";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function POST(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || (admin.role !== "Owner" && admin.role !== "Manager")) {
      return Response.json({ error: "Forbidden: Owner or Manager role required" }, { status: 403 });
    }

    const {
      name,
      emoji,
      bg,
      price,
      oldPrice,
      ageRange,
      isFeatured,
      tag,
      tagClass,
      description,
      sizes,
    } = await req.json();

    if (!name || !emoji || !bg || !price || !ageRange) {
      return Response.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        emoji,
        bg,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        ageRange,
        isFeatured: !!isFeatured,
        tag: tag || null,
        tagClass: tagClass || "p-c",
        description: description || "",
        sizes: {
          create: (sizes || []).map((s) => ({
            size: s.size,
            stock: parseInt(s.stock) || 0,
          })),
        },
      },
    });

    return Response.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || (admin.role !== "Owner" && admin.role !== "Manager")) {
      return Response.json({ error: "Forbidden: Owner or Manager role required" }, { status: 403 });
    }

    const {
      id,
      name,
      emoji,
      bg,
      price,
      oldPrice,
      ageRange,
      isFeatured,
      tag,
      tagClass,
      description,
      sizes,
    } = await req.json();

    if (!id || !name || !emoji || !bg || !price || !ageRange) {
      return Response.json({ error: "Missing required product update parameters" }, { status: 400 });
    }

    const prodId = parseInt(id);

    // Delete existing sizes first (simplest way to update relational rows)
    await prisma.productSizeStock.deleteMany({
      where: { productId: prodId },
    });

    const updatedProduct = await prisma.product.update({
      where: { id: prodId },
      data: {
        name,
        emoji,
        bg,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        ageRange,
        isFeatured: !!isFeatured,
        tag: tag || null,
        tagClass: tagClass || "p-c",
        description: description || "",
        sizes: {
          create: (sizes || []).map((s) => ({
            size: s.size,
            stock: parseInt(s.stock) || 0,
          })),
        },
      },
    });

    return Response.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || (admin.role !== "Owner" && admin.role !== "Manager")) {
      return Response.json({ error: "Forbidden: Owner or Manager role required" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Product ID is required" }, { status: 400 });
    }

    const prodId = parseInt(id);

    // Clear child relations first (cascading deletes in SQLite)
    await prisma.productSizeStock.deleteMany({ where: { productId: prodId } });
    await prisma.review.deleteMany({ where: { productId: prodId } });
    await prisma.orderItem.deleteMany({ where: { productId: prodId } });

    await prisma.product.delete({
      where: { id: prodId },
    });

    return Response.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
