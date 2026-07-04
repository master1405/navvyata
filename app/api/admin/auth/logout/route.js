export async function POST() {
  try {
    const response = Response.json({ success: true, message: "Admin logged out" });
    // Expire admin cookie session
    response.headers.set(
      "Set-Cookie",
      "admin_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );
    return response;
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to log out" }, { status: 500 });
  }
}
