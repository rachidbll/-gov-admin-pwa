import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany();
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { text, type, options, required, condition } = await request.json();

    if (!text || !type) {
      return NextResponse.json({ error: "Question text and type are required" }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        text,
        type,
        options: options || [],
        required: required || false,
        condition,
      },
    });

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
