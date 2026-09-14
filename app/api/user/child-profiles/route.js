import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

/**
 * Child Profile API Handlers
 * Allows parents to manage child profiles for automated size recommendations and personalized shopping.
 */

// POST /api/user/child-profiles - Create child profile
export async function POST(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, age, height, size, isDefault } = await req.json();

    if (!name || isNaN(age)) {
      return Response.json({ error: "Name and age are required" }, { status: 400 });
    }

    const shouldBeDefault = isDefault || user.childProfiles.length === 0;

    if (shouldBeDefault) {
      await prisma.childProfile.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newProfile = await prisma.childProfile.create({
      data: {
        userId: user.id,
        name: name.trim(),
        age: parseInt(age),
        height: height ? parseFloat(height) : null,
        size: size || null,
        isDefault: shouldBeDefault,
      },
    });

    return Response.json({ success: true, profile: newProfile });
  } catch (err) {
    console.error("Child profile creation error:", err);
    return Response.json({ error: "Failed to save child profile" }, { status: 500 });
  }
}

// PUT /api/user/child-profiles - Update existing child profile
export async function PUT(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, age, height, size, isDefault } = await req.json();

    if (!id) {
      return Response.json({ error: "Child profile ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.childProfile.findFirst({
      where: { id: parseInt(id), userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    if (isDefault) {
      await prisma.childProfile.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.childProfile.update({
      where: { id: existing.id },
      data: {
        name: name ? name.trim() : existing.name,
        age: age !== undefined ? parseInt(age) : existing.age,
        height: height !== undefined ? (height ? parseFloat(height) : null) : existing.height,
        size: size !== undefined ? size : existing.size,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    return Response.json({ success: true, profile: updated });
  } catch (err) {
    console.error("Child profile update error:", err);
    return Response.json({ error: "Failed to update child profile" }, { status: 500 });
  }
}

// DELETE /api/user/child-profiles - Delete child profile
export async function DELETE(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Child profile ID required" }, { status: 400 });
    }

    const existing = await prisma.childProfile.findFirst({
      where: { id: parseInt(id), userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }

    await prisma.childProfile.delete({
      where: { id: existing.id },
    });

    // If default was deleted, promote another child if exists
    if (existing.isDefault) {
      const nextDefault = await prisma.childProfile.findFirst({
        where: { userId: user.id },
      });
      if (nextDefault) {
        await prisma.childProfile.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Child profile deletion error:", err);
    return Response.json({ error: "Failed to delete child profile" }, { status: 500 });
  }
}
