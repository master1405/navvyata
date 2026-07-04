import prisma from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/adminAuth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || !verifyPassword(password, admin.password)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Set secure session cookie containing base64 encoded user info
    const payload = JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
    const base64Session = Buffer.from(payload).toString("base64");

    const response = Response.json({
      success: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
    
    // Cookie expires in 12 hours
    response.headers.set(
      "Set-Cookie",
      `admin_session=${base64Session}; Path=/; HttpOnly; Max-Age=43200; SameSite=Lax`
    );

    return response;
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
