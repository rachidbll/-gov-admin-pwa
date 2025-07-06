import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { intervieweeName, intervieweeId, location } = await request.json();

    if (!intervieweeName) {
      return NextResponse.json({ error: "Interviewee name is required" }, { status: 400 });
    }

    const newInterview = await prisma.interview.create({
      data: {
        intervieweeName,
        intervieweeId,
        location,
      },
    });

    return NextResponse.json({ interview: newInterview }, { status: 201 });
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: { answers: true },
    });
    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
