import { type NextRequest, NextResponse } from "next/server"

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

    // Validate form data
    if (!formData.title || !formData.fields || formData.fields.length === 0) {
      return NextResponse.json({ error: "Form title and at least one field are required" }, { status: 400 })
    }

    // Generate form ID
    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create form object
    const form = {
      id: formId,
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      submissionCount: 0,
      version: 1,
    }

    // In a real application, this would save to a database
    // For now, we'll simulate saving to localStorage on the client side

    return NextResponse.json({
      success: true,
      form,
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

    // Mock forms data
    const mockForms = [
      {
        id: "form_1",
        title: "Employee Registration Form",
        description: "New employee onboarding form",
        status: "active",
        submissionCount: 25,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "form_2",
        title: "Citizen Service Request",
        description: "General service request form for citizens",
        status: "active",
        submissionCount: 142,
        createdAt: "2024-01-10T14:30:00Z",
        updatedAt: "2024-01-12T09:15:00Z",
      },
      {
        id: "form_3",
        title: "Building Permit Application",
        description: "Application form for building permits",
        status: "draft",
        submissionCount: 0,
        createdAt: "2024-01-20T16:45:00Z",
        updatedAt: "2024-01-20T16:45:00Z",
      },
    ]

    // Filter by status if provided
    const filteredForms = status ? mockForms.filter((form) => form.status === status) : mockForms

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedForms = filteredForms.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      forms: paginatedForms,
      pagination: {
        page,
        limit,
        total: filteredForms.length,
        totalPages: Math.ceil(filteredForms.length / limit),
      },
    })
  } catch (error) {
    console.error("Forms fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}
