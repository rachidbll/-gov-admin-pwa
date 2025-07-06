import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Check if an admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 });
    }

    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: "admin@gov.org",
        password: hashedPassword,
        name: "System Administrator",
        role: "ADMIN",
        isDefaultPassword: true,
      },
    });

    return NextResponse.json({ message: "Admin user created successfully", user: newAdmin }, { status: 201 });
  } catch (error) {
    console.error("Error seeding admin user:", error);
    return NextResponse.json({ error: "Failed to seed admin user" }, { status: 500 });
  }
}
