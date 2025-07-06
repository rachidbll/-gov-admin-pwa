import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = params;

    // In a real application, this would trigger the actual Google Sheets API sync.
    // For now, we'll just update the lastSync timestamp and status.
    const updatedConnection = await prisma.googleSheetConnection.update({
      where: { id: connectionId },
      data: { lastSync: new Date(), status: "connected" },
    });

    return NextResponse.json({ success: true, connection: updatedConnection }, { status: 200 });
  } catch (error) {
    console.error("Google Sheets sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
