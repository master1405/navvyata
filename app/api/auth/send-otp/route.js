export async function POST(req) {
  try {
    const { phone } = await req.json();
    if (!phone || phone.length < 10) {
      return Response.json({ error: "Invalid mobile number" }, { status: 400 });
    }
    // Simulate sending OTP (We use static code 4289 for debug verification)
    return Response.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
