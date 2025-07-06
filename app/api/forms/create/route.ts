import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface FormField {
  id: string
  label: string
  type: "text" | "number" | "email" | "date" | "select" | "textarea" | "checkbox" | "radio"
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

interface FormData {
  title: string
  description: string
  fields: FormField[]
  settings: {
    allowMultipleSubmissions: boolean
    requireAuthentication: boolean
    notificationEmail?: string
    expirationDate?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Prisma object:", prisma);

    // Validate form data
    if (!formData.title || !formData.fields || formData.fields.length === 0) {
      return NextResponse.json({ error: "Form title and at least one field are required" }, { status: 400 })
    }

    const newForm = await prisma.form.create({
      data: {
        title: formData.title,
        description: formData.description,
        fields: formData.fields, // Prisma handles JSON fields automatically
        settings: formData.settings, // Prisma handles JSON fields automatically
        status: "draft", // Default status
        submissionCount: 0, // Default
        version: 1, // Default
      },
    })

    return NextResponse.json({
      success: true,
      form: newForm,
      message: "Form created successfully",
    })
  } catch (error) {
    console.error("Form creation error:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }

    const totalForms = await prisma.form.count({
      where: whereClause,
    })

    const forms = await prisma.form.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      forms,
      pagination: {
        page,
        limit,
        total: totalForms,
        totalPages: Math.ceil(totalForms / limit),
      },
    })
  } catch (error) {
    console.error("Forms fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}
