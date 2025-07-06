import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

export async function POST(request: Request) {
  try {
    const { email, password, type } = await request.json();

    if (type === "email") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Set a cookie for session management (for simplicity, using a basic token)
      const token = Buffer.from(user.id).toString("base64"); // Simple token, replace with JWT in production
      const cookie = serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return new NextResponse(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin,
            isDefaultPassword: user.isDefaultPassword,
          },
        }),
        {
          status: 200,
          headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
        }
      );
    } else if (type === "government") {
      // Government ID login (mocked for now)
      // In a real application, this would involve integration with a government authentication system
      return NextResponse.json({ error: "Government ID login not yet implemented" }, { status: 501 });
    } else {
      return NextResponse.json({ error: "Invalid login type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
