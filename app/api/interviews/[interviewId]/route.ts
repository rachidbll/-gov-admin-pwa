import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { interviewId: string } }
) {
  try {
    const { interviewId } = params;
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { answers: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ interview }, { status: 200 });
  } catch (error) {
    console.error("Get interview by ID error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { interviewId: string } }
) {
  try {
    const { interviewId } = params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: { status },
    });

    return NextResponse.json({ interview: updatedInterview }, { status: 200 });
  } catch (error) {
    console.error("Update interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
