import prisma from "@/app/lib/prisma";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, tag, readTime, content, emoji } = await req.json();

    if (!title || !tag || !readTime || !content || !emoji) {
      return Response.json({ error: "Missing required blog post parameters" }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        tag,
        readTime,
        content,
        emoji,
      },
    });

    return Response.json({ success: true, post });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Blog post ID is required" }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ success: true, message: "Blog post deleted successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
