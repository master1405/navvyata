import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  const phone = sessionCookie?.value;

  if (!phone) return null;

  try {
    return await prisma.user.findUnique({
      where: { phone },
      include: {
        addresses: true,
        childProfiles: true,
      },
    });
  } catch (err) {
    console.error("Failed to retrieve user from session", err);
    return null;
  }
}
