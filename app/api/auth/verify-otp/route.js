import prisma from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const { phone, otp } = await req.json();

    if (otp !== "4289") {
      return Response.json({ error: "Invalid OTP code. Use 4289." }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        addresses: true,
        childProfiles: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          coins: 480, // Seed initial coin balance
          addresses: {
            create: {
              name: "Priya Sharma",
              phone: "+91 98765 43210",
              address: "42, Green Park Colony",
              pincode: "440010",
              city: "Nagpur",
              state: "Maharashtra",
              type: "Home",
              isDefault: true,
            },
          },
          childProfiles: {
            create: {
              name: "Aanya",
              age: 5,
              size: "4–5Y",
              isDefault: true,
            },
          },
        },
        include: {
          addresses: true,
          childProfiles: true,
        },
      });
    }

    // Set cookie headers for session state
    const response = Response.json({ success: true, user });
    response.headers.set(
      "Set-Cookie",
      `session=${phone}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`
    );
    return response;
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Authentication verification failed" }, { status: 500 });
  }
}
