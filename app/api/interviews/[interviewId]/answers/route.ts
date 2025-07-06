import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { interviewId: string } }
) {
  try {
    const { interviewId } = params;
    const { questionId, value } = await request.json();

    if (!questionId || value === undefined) {
      return NextResponse.json({ error: "Question ID and value are required" }, { status: 400 });
    }

    const newAnswer = await prisma.answer.create({
      data: {
        interviewId,
        questionId,
        value,
      },
    });

    return NextResponse.json({ answer: newAnswer }, { status: 201 });
  } catch (error) {
    console.error("Add answer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
