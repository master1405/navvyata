import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, age, height, size } = await req.json();

    if (!name || isNaN(age)) {
      return Response.json({ error: "Name and age are required" }, { status: 400 });
    }

    // Set other child default active to false if this is first profile
    const isFirstProfile = user.childProfiles.length === 0;

    const newProfile = await prisma.childProfile.create({
      data: {
        userId: user.id,
        name,
        age,
        height: height ? parseFloat(height) : null,
        size,
        isDefault: isFirstProfile,
      },
    });

    return Response.json({ success: true, profile: newProfile });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to save child profile" }, { status: 500 });
  }
}
