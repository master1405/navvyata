import prisma from "@/app/lib/prisma";
import { getAdminFromSession, hashPassword } from "@/app/lib/adminAuth";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.role !== "Owner") {
      return Response.json({ error: "Forbidden: Owner role required" }, { status: 403 });
    }

    const team = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json({ success: true, team });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.role !== "Owner") {
      return Response.json({ error: "Forbidden: Owner role required" }, { status: 403 });
    }

    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return Response.json({ error: "Email address is already in use" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const newMember = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
    });

    return Response.json({
      success: true,
      member: { id: newMember.id, email: newMember.email, name: newMember.name, role: newMember.role },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.role !== "Owner") {
      return Response.json({ error: "Forbidden: Owner role required" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Prevent deleting self
    if (admin.id === id) {
      return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await prisma.adminUser.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ success: true, message: "Member deleted successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
