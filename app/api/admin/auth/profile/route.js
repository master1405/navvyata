import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ admin: null });
    }
    return Response.json({ admin });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
