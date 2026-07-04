import prisma from "@/app/lib/prisma";
import { getUserFromSession } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, address, pincode, city, state, type } = await req.json();

    // Check parameters
    if (!name || !phone || !address || !pincode || !city || !state || !type) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Set other addresses isDefault to false if this is first address
    const isFirstAddress = user.addresses.length === 0;

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: user.id,
        name,
        phone,
        address,
        pincode,
        city,
        state,
        type,
        isDefault: isFirstAddress,
      },
    });

    return Response.json({ success: true, address: newAddress });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to save address" }, { status: 500 });
  }
}
