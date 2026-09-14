import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

/**
 * Address API Handlers for Customer Account and Checkout
 * Follows strict authorization ensuring users can only mutate their own addresses.
 */

// POST /api/user/addresses - Create new delivery address
export async function POST(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, address, pincode, city, state, type, isDefault } = await req.json();

    // Check required fields
    if (!name || !phone || !address || !pincode || !city || !state || !type) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If this is the user's first address or marked default, set default
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    if (shouldBeDefault) {
      // Demote existing defaults to ensure single default invariant
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: user.id,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        city: city.trim(),
        state: state.trim(),
        type,
        isDefault: shouldBeDefault,
      },
    });

    return Response.json({ success: true, address: newAddress });
  } catch (err) {
    console.error("Address creation failed:", err);
    return Response.json({ error: "Failed to save address" }, { status: 500 });
  }
}

// PUT /api/user/addresses - Update an existing delivery address
export async function PUT(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, phone, address, pincode, city, state, type, isDefault } = await req.json();

    if (!id) {
      return Response.json({ error: "Address ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.userAddress.findFirst({
      where: { id: parseInt(id), userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    if (isDefault) {
      // Clear default flag on other addresses
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.userAddress.update({
      where: { id: existing.id },
      data: {
        name: name ? name.trim() : existing.name,
        phone: phone ? phone.trim() : existing.phone,
        address: address ? address.trim() : existing.address,
        pincode: pincode ? pincode.trim() : existing.pincode,
        city: city ? city.trim() : existing.city,
        state: state ? state.trim() : existing.state,
        type: type || existing.type,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    return Response.json({ success: true, address: updated });
  } catch (err) {
    console.error("Address update failed:", err);
    return Response.json({ error: "Failed to update address" }, { status: 500 });
  }
}

// DELETE /api/user/addresses - Remove a delivery address
export async function DELETE(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Address ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.userAddress.findFirst({
      where: { id: parseInt(id), userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    await prisma.userAddress.delete({
      where: { id: existing.id },
    });

    // If the deleted address was default, promote the first remaining address to default
    if (existing.isDefault) {
      const nextDefault = await prisma.userAddress.findFirst({
        where: { userId: user.id },
      });
      if (nextDefault) {
        await prisma.userAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Address deletion failed:", err);
    return Response.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
