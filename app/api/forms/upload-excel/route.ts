import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files." },
        { status: 400 },
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process the Excel file
    const result = await processExcelFile(buffer, file.name)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Excel processing error:", error)
    return NextResponse.json({ error: "Failed to process Excel file" }, { status: 500 })
  }
}

async function processExcelFile(buffer: Buffer, filename: string) {
  // This would typically use a Python service or Node.js Excel library
  // For now, we'll simulate the pandas-like processing

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock Excel data with sample rows for DataFrame preview
  const mockExcelData = {
    filename,
    sheets: ["Sheet1"],
    columns: [
      {
        name: "full_name",
        displayName: "Full Name",
        dataType: "string",
        sampleValues: ["John Doe", "Jane Smith", "Mike Johnson"],
        nullCount: 0,
        uniqueCount: 3,
      },
      {
        name: "email_address",
        displayName: "Email Address",
        dataType: "string",
        sampleValues: ["john@example.com", "jane@example.com", "mike@example.com"],
        nullCount: 0,
        uniqueCount: 3,
      },
      {
        name: "phone_number",
        displayName: "Phone Number",
        dataType: "string",
        sampleValues: ["(555) 123-4567", "(555) 987-6543", null],
        nullCount: 1,
        uniqueCount: 2,
      },
      {
        name: "date_of_birth",
        displayName: "Date of Birth",
        dataType: "date",
        sampleValues: ["1985-03-15", "1990-07-22", "1988-11-08"],
        nullCount: 0,
        uniqueCount: 3,
      },
      {
        name: "department",
        displayName: "Department",
        dataType: "categorical",
        sampleValues: ["HR", "IT", "Finance"],
        nullCount: 0,
        uniqueCount: 4,
        categories: ["HR", "IT", "Finance", "Operations"],
      },
      {
        name: "salary",
        displayName: "Salary",
        dataType: "number",
        sampleValues: [50000, 75000, null],
        nullCount: 1,
        uniqueCount: 2,
      },
      {
        name: "is_active",
        displayName: "Is Active",
        dataType: "boolean",
        sampleValues: [true, true, false],
        nullCount: 0,
        uniqueCount: 2,
      },
    ],
    // Add sample rows for DataFrame preview
    sampleRows: [
      {
        "Full Name": "John Doe",
        "Email Address": "john@example.com",
        "Phone Number": "(555) 123-4567",
        "Date of Birth": "1985-03-15",
        Department: "HR",
        Salary: 50000,
        "Is Active": true,
      },
      {
        "Full Name": "Jane Smith",
        "Email Address": "jane@example.com",
        "Phone Number": "(555) 987-6543",
        "Date of Birth": "1990-07-22",
        Department: "IT",
        Salary: 75000,
        "Is Active": true,
      },
      {
        "Full Name": "Mike Johnson",
        "Email Address": "mike@example.com",
        "Phone Number": null,
        "Date of Birth": "1988-11-08",
        Department: "Finance",
        Salary: null,
        "Is Active": false,
      },
      {
        "Full Name": "Sarah Wilson",
        "Email Address": "sarah@example.com",
        "Phone Number": "(555) 456-7890",
        "Date of Birth": "1992-05-18",
        Department: "Operations",
        Salary: 65000,
        "Is Active": true,
      },
      {
        "Full Name": "David Brown",
        "Email Address": "david@example.com",
        "Phone Number": "(555) 321-0987",
        "Date of Birth": "1987-09-12",
        Department: "HR",
        Salary: 55000,
        "Is Active": true,
      },
    ],
    rowCount: 150,
    metadata: {
      processedAt: new Date().toISOString(),
      fileSize: buffer.length,
      encoding: "utf-8",
    },
  }

  return mockExcelData
}
