import { getUserFromSession } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ user: null });
    }
    return Response.json({ user });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load user profile" }, { status: 500 });
  }
}
