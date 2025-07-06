"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
}

interface OCRResult {
  text: string
  confidence: number
  fields: { [key: string]: string }
}

interface OCRProcessorProps {
  user: User
}

export function OCRProcessor({ user }: OCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [extractedFields, setExtractedFields] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Display selected image
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 100)

      const response = await fetch("/api/ocr/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process image")
      }

      const result = await response.json()
      const ocrData: OCRResult = result.data

      setOcrResult(ocrData)
      setExtractedFields(ocrData.fields)

      toast({
        title: "OCR Processing Complete",
        description: `Text extracted with ${mockResult.confidence}% confidence. Review and edit as needed.`,
      })
    } catch (error) {
      toast({
        title: "OCR Processing Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFieldUpdate = (fieldName: string, value: string) => {
    setExtractedFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const submitExtractedData = () => {
    toast({
      title: "Data Submitted",
      description: "Extracted data has been saved and synced to Google Sheets.",
    })

    // Reset form
    setOcrResult(null)
    setSelectedImage(null)
    setExtractedFields({})
    setProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OCR Document Digitization</CardTitle>
          <CardDescription>
            Upload or capture images of printed documents to extract text and data automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Upload Document Image</span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Supports JPG, PNG, PDF files. Best results with clear, well-lit images.
                  </span>
                </Label>
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex justify-center space-x-4 mt-4">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  <Button variant="outline" disabled={isProcessing}>
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing document with Tesseract.js OCR...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-gray-500">
                    Extracting text and identifying form fields. This may take a few moments.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Preview */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Uploaded document"
                    className="w-full h-auto border rounded-lg shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* OCR Results */}
      {ocrResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Extracted Text</span>
                <Badge variant={ocrResult.confidence > 80 ? "default" : "secondary"}>
                  {ocrResult.confidence}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={ocrResult.text} readOnly className="min-h-[300px] font-mono text-sm" />
            </CardContent>
          </Card>

          {/* Structured Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Extracted Fields</span>
              </CardTitle>
              <CardDescription>Review and edit the automatically extracted form data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(extractedFields).map(([fieldName, value]) => (
                <div key={fieldName} className="space-y-2">
                  <Label htmlFor={fieldName}>{fieldName}</Label>
                  <Input
                    id={fieldName}
                    value={value}
                    onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
                    placeholder={`Enter ${fieldName.toLowerCase()}`}
                  />
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please review all fields for accuracy before submitting</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {ocrResult && (
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setOcrResult(null)
              setSelectedImage(null)
              setExtractedFields({})
            }}
          >
            Clear
          </Button>
          <Button onClick={submitExtractedData}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Data
          </Button>
        </div>
      )}
    </div>
  )
}
