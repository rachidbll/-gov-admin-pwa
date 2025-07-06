import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = params;
    const connection = await prisma.googleSheetConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    return NextResponse.json({ connection }, { status: 200 });
  } catch (error) {
    console.error("Get Google Sheet connection by ID error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = params;
    const { name, sheetId, formType, autoSync, status } = await request.json();

    const updatedConnection = await prisma.googleSheetConnection.update({
      where: { id: connectionId },
      data: { name, sheetId, formType, autoSync, status },
    });

    return NextResponse.json({ connection: updatedConnection }, { status: 200 });
  } catch (error) {
    console.error("Update Google Sheet connection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = params;

    await prisma.googleSheetConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete Google Sheet connection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
