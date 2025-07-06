"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, Plus, Trash2, Save, Eye, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExcelProcessor, type ExcelProcessingResult } from "@/lib/excel-processor"
import { DataFramePreview } from "./dataframe-preview"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
}

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

interface FormCreatorProps {
  user: User
}

export function FormCreator({ user }: FormCreatorProps) {
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [fields, setFields] = useState<FormField[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [excelData, setExcelData] = useState<ExcelProcessingResult | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Process the Excel file
      const result = await ExcelProcessor.processFile(file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setExcelData(result)

      // Auto-select all columns initially
      const allColumnNames = new Set(result.columns.map((col) => col.name))
      setSelectedColumns(allColumnNames)

      // Generate initial form structure
      const generatedForm = ExcelProcessor.generateFormFromColumns(result.columns, result.filename)
      setFormTitle(generatedForm.title)
      setFormDescription(generatedForm.description)
      setFields(generatedForm.fields)

      toast({
        title: "Excel File Processed Successfully",
        description: `Analyzed ${result.columnCount} columns from ${result.rowCount} rows. Review and customize the generated fields.`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process Excel file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const toggleColumnSelection = (columnName: string) => {
    const newSelection = new Set(selectedColumns)
    if (newSelection.has(columnName)) {
      newSelection.delete(columnName)
    } else {
      newSelection.add(columnName)
    }
    setSelectedColumns(newSelection)

    // Update fields based on selection
    if (excelData) {
      const selectedColumnsData = excelData.columns.filter((col) => newSelection.has(col.name))
      const newFields = selectedColumnsData.map((col) => ExcelProcessor.mapColumnToFormField(col))
      setFields(newFields)
    }
  }

  const addManualField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value",
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))

    // Also remove from selected columns if it came from Excel
    if (excelData) {
      const fieldToRemove = fields.find((f) => f.id === id)
      if (fieldToRemove) {
        const columnName = excelData.columns.find((col) => col.displayName === fieldToRemove.label)?.name
        if (columnName) {
          const newSelection = new Set(selectedColumns)
          newSelection.delete(columnName)
          setSelectedColumns(newSelection)
        }
      }
    }
  }

  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Form Title Required",
        description: "Please enter a title for your form.",
        variant: "destructive",
      })
      return
    }

    if (fields.length === 0) {
      toast({
        title: "No Fields Added",
        description: "Please add at least one field to your form.",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        fields,
        settings: {
          allowMultipleSubmissions: true,
          requireAuthentication: true,
        },
      }

      const response = await fetch("/api/forms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create form")
      }

      const result = await response.json()

      toast({
        title: "Form Created Successfully",
        description: `Form "${formTitle}" has been saved and is ready for deployment.`,
      })

      // Reset form
      setFormTitle("")
      setFormDescription("")
      setFields([])
      setExcelData(null)
      setSelectedColumns(new Set())
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save form. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return "📧"
      case "number":
        return "🔢"
      case "date":
        return "📅"
      case "select":
        return "📋"
      case "textarea":
        return "📝"
      case "checkbox":
        return "☑️"
      default:
        return "📄"
    }
  }

  const getDataQualityColor = (nullPercentage: number) => {
    if (nullPercentage === 0) return "text-green-600"
    if (nullPercentage < 10) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>
            Upload an Excel template or create a form from scratch using pandas-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Excel Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="excel-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Upload Excel Template</span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Automatically extract and analyze form fields using pandas
                  </span>
                </Label>
                <Input
                  id="excel-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Processing..." : "Choose Excel File"}
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">Processing with pandas... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* DataFrame Preview */}
          {excelData && (
            <DataFramePreview
              data={excelData}
              selectedColumns={selectedColumns}
              onColumnToggle={toggleColumnSelection}
              onGenerateForm={() => {
                if (selectedColumns.size === 0) {
                  toast({
                    title: "No Columns Selected",
                    description: "Please select at least one column to generate the form.",
                    variant: "destructive",
                  })
                  return
                }

                // Generate form from selected columns
                const selectedColumnsData = excelData.columns.filter((col) => selectedColumns.has(col.name))
                const generatedForm = ExcelProcessor.generateFormFromColumns(selectedColumnsData, excelData.filename)

                setFormTitle(generatedForm.title)
                setFormDescription(generatedForm.description)
                setFields(generatedForm.fields)

                toast({
                  title: "Form Generated",
                  description: `Created form with ${selectedColumns.size} fields. You can now customize and save it.`,
                })
              }}
            />
          )}

          {/* Form Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Input
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of the form"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>
              {excelData
                ? "Fields generated from Excel analysis. You can modify or add more."
                : "Configure your form fields and validation"}
            </CardDescription>
          </div>
          <Button onClick={addManualField} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Manual Field
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No fields added yet. Upload an Excel template or add fields manually.
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{field.type}</Badge>
                      {excelData && (
                        <Badge variant="secondary">
                          <Info className="h-3 w-3 mr-1" />
                          Auto-detected
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(field.id, { type: value as FormField["type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="radio">Radio Button</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                      />
                    </div>
                  </div>

                  {(field.type === "select" || field.type === "radio") && (
                    <div className="space-y-2">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value
                              .split(",")
                              .map((opt) => opt.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <Label>Required field</Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button onClick={saveForm}>
          <Save className="mr-2 h-4 w-4" />
          Save Form
        </Button>
      </div>
    </div>
  )
}
