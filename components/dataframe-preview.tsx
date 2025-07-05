"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, CheckCircle, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react"
import type { ExcelProcessingResult } from "@/lib/excel-processor"

interface DataFramePreviewProps {
  data: ExcelProcessingResult
  selectedColumns: Set<string>
  onColumnToggle: (columnName: string) => void
  onGenerateForm: () => void
}

export function DataFramePreview({ data, selectedColumns, onColumnToggle, onGenerateForm }: DataFramePreviewProps) {
  const [showAllRows, setShowAllRows] = useState(false)
  const [showColumnDetails, setShowColumnDetails] = useState(false)

  const displayRows = showAllRows ? data.sampleRows : data.sampleRows.slice(0, 3)
  const columnNames = data.columns.map((col) => col.displayName)

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case "string":
        return "📝"
      case "number":
        return "🔢"
      case "date":
        return "📅"
      case "boolean":
        return "☑️"
      case "categorical":
        return "📋"
      default:
        return "📄"
    }
  }

  const getDataQualityColor = (nullCount: number, totalCount: number) => {
    const nullPercentage = (nullCount / totalCount) * 100
    if (nullPercentage === 0) return "text-green-600"
    if (nullPercentage < 10) return "text-yellow-600"
    return "text-red-600"
  }

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>
    }
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value.toString()}</Badge>
    }
    if (typeof value === "number") {
      return <span className="font-mono">{value.toLocaleString()}</span>
    }
    return <span>{value.toString()}</span>
  }

  return (
    <div className="space-y-6">
      {/* DataFrame Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Database className="h-5 w-5" />
            <span>DataFrame Preview</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            {data.filename} • {data.rowCount} rows × {data.columnCount} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Total Rows</div>
              <div className="text-2xl font-bold text-blue-600">{data.rowCount.toLocaleString()}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Columns</div>
              <div className="text-2xl font-bold text-blue-600">{data.columnCount}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Selected</div>
              <div className="text-2xl font-bold text-green-600">{selectedColumns.size}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Memory</div>
              <div className="text-lg font-bold text-gray-600">
                {data.metadata.memoryUsage ? `${Math.round(data.metadata.memoryUsage / 1024)} KB` : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Column Selection</CardTitle>
              <CardDescription>
                Choose which columns to include in your form. Click on column headers to toggle selection.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowColumnDetails(!showColumnDetails)}>
                {showColumnDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showColumnDetails ? "Hide" : "Show"} Details
              </Button>
              <Button
                onClick={onGenerateForm}
                disabled={selectedColumns.size === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Form ({selectedColumns.size} fields)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Column Details Panel */}
          {showColumnDetails && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.columns.map((column) => (
                <div
                  key={column.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedColumns.has(column.name)
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => onColumnToggle(column.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedColumns.has(column.name)}
                        onChange={() => {}} // Handled by parent click
                      />
                      <span className="text-lg">{getDataTypeIcon(column.dataType)}</span>
                    </div>
                    {selectedColumns.has(column.name) && <CheckCircle className="h-4 w-4 text-blue-600" />}
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-sm">{column.displayName}</div>
                    <div className="text-xs text-gray-500">
                      Type:{" "}
                      <Badge variant="outline" className="text-xs">
                        {column.dataType}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Unique: {column.uniqueCount.toLocaleString()}</div>
                      <div className={getDataQualityColor(column.nullCount, data.rowCount)}>
                        Null: {column.nullCount} ({((column.nullCount / data.rowCount) * 100).toFixed(1)}%)
                      </div>
                    </div>

                    {/* Sample Values */}
                    <div className="text-xs">
                      <div className="text-gray-500 mb-1">Sample values:</div>
                      <div className="space-y-1">
                        {column.sampleValues.slice(0, 2).map((value, idx) => (
                          <div key={idx} className="truncate">
                            {formatCellValue(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DataFrame Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">
                Data Preview ({displayRows.length} of {data.sampleRows.length} sample rows)
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAllRows(!showAllRows)}>
                {showAllRows ? "Show Less" : `Show All ${data.sampleRows.length} Rows`}
              </Button>
            </div>

            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    {columnNames.map((columnName) => {
                      const column = data.columns.find((col) => col.displayName === columnName)
                      const isSelected = selectedColumns.has(column?.name || "")

                      return (
                        <TableHead
                          key={columnName}
                          className={`cursor-pointer transition-colors min-w-32 ${
                            isSelected ? "bg-blue-100 text-blue-800 border-blue-300" : "hover:bg-gray-100"
                          }`}
                          onClick={() => column && onColumnToggle(column.name)}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => {}} // Handled by parent click
                            />
                            <div>
                              <div className="font-medium">{columnName}</div>
                              <div className="text-xs font-normal text-gray-500">
                                {getDataTypeIcon(column?.dataType || "")} {column?.dataType}
                              </div>
                            </div>
                          </div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-gray-50">
                      <TableCell className="text-center text-gray-500 font-mono text-sm">{rowIndex + 1}</TableCell>
                      {columnNames.map((columnName) => {
                        const column = data.columns.find((col) => col.displayName === columnName)
                        const isSelected = selectedColumns.has(column?.name || "")

                        return (
                          <TableCell
                            key={columnName}
                            className={`${
                              isSelected ? "bg-blue-50" : ""
                            } ${row[columnName] === null ? "bg-red-50" : ""}`}
                          >
                            {formatCellValue(row[columnName])}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Selection Summary */}
          {selectedColumns.size > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  {selectedColumns.size} column{selectedColumns.size !== 1 ? "s" : ""} selected for form generation
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from(selectedColumns).map((columnName) => {
                  const column = data.columns.find((col) => col.name === columnName)
                  return (
                    <Badge key={columnName} variant="secondary" className="text-xs">
                      {getDataTypeIcon(column?.dataType || "")} {column?.displayName}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {selectedColumns.size === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">No columns selected</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Click on column headers or use the checkboxes to select columns for your form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
