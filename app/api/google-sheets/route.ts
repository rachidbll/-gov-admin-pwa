import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, sheetId, formType, autoSync } = await request.json();

    if (!name || !sheetId || !formType) {
      return NextResponse.json({ error: "Name, sheet ID, and form type are required" }, { status: 400 });
    }

    const newConnection = await prisma.googleSheetConnection.create({
      data: {
        name,
        sheetId,
        formType,
        autoSync: autoSync ?? true,
      },
    });

    return NextResponse.json({ connection: newConnection }, { status: 201 });
  } catch (error) {
    console.error("Create Google Sheet connection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const connections = await prisma.googleSheetConnection.findMany();
    return NextResponse.json({ connections }, { status: 200 });
  } catch (error) {
    console.error("Get Google Sheet connections error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
