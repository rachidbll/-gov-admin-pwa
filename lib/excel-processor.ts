"use client"

export interface ExcelColumn {
  name: string
  displayName: string
  dataType: string
  fieldType: "text" | "number" | "email" | "date" | "select" | "textarea" | "checkbox" | "radio"
  sampleValues: any[]
  nullCount: number
  uniqueCount: number
  totalCount: number
  nullPercentage: number
  categories?: string[]
}

export interface ExcelProcessingResult {
  filename: string
  rowCount: number
  columnCount: number
  columns: ExcelColumn[]
  sampleRows: Record<string, any>[]
  metadata: {
    processedAt: string
    memoryUsage?: number
    dtypes?: Record<string, string>
  }
}

export class ExcelProcessor {
  static async processFile(file: File): Promise<ExcelProcessingResult> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/forms/upload-excel", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process Excel file")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Excel processing error:", error)
      throw error
    }
  }

  static mapColumnToFormField(column: ExcelColumn) {
    const baseField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: column.displayName,
      type: column.fieldType,
      required: column.nullPercentage < 10, // Required if less than 10% null values
      placeholder: `Enter ${column.displayName.toLowerCase()}`,
    }

    // Add specific configurations based on field type
    switch (column.fieldType) {
      case "select":
        return {
          ...baseField,
          options: column.categories || [],
        }

      case "email":
        return {
          ...baseField,
          placeholder: "Enter email address",
          validation: {
            pattern: "^[^@]+@[^@]+\\.[^@]+$",
            message: "Please enter a valid email address",
          },
        }

      case "number":
        return {
          ...baseField,
          placeholder: "Enter number",
          validation: {
            min: 0,
            message: "Please enter a valid number",
          },
        }

      case "date":
        return {
          ...baseField,
          placeholder: "Select date",
        }

      case "textarea":
        return {
          ...baseField,
          placeholder: `Enter ${column.displayName.toLowerCase()}...`,
        }

      default:
        return baseField
    }
  }

  static generateFormFromColumns(columns: ExcelColumn[], filename: string) {
    const fields = columns.map((column) => this.mapColumnToFormField(column))

    // Generate form title from filename
    const formTitle = filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letter of each word

    return {
      title: `${formTitle} Form`,
      description: `Auto-generated form from ${filename}`,
      fields,
      settings: {
        allowMultipleSubmissions: true,
        requireAuthentication: true,
      },
    }
  }
}
