"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Receipt } from "@/lib/types"
import { FileText, DollarSign, MapPin } from "lucide-react"
import { format } from "date-fns"

interface ReceiptDetailsModalProps {
  receipt: Receipt
  children: React.ReactNode
}

export function ReceiptDetailsModal({ receipt, children }: ReceiptDetailsModalProps) {
  const [extractedData, setExtractedData] = useState<any>(null)

  const parseJsonData = () => {
    if (!receipt.json_data) return null

    try {
      const parsed = JSON.parse(receipt.json_data)
      console.log("Parsed JSON data:", parsed) // Debug log
      return parsed
    } catch (error) {
      console.error("Error parsing JSON data:", error)
      return null
    }
  }

  const jsonData = parseJsonData()

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Details: {receipt.file_name}
          </DialogTitle>
          <DialogDescription>Detailed information extracted from the receipt image</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structured">Structured Data</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Name:</span>
                    <span className="font-medium">{receipt.file_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upload Time:</span>
                    <span className="font-medium">{format(new Date(receipt.upload_time), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merchant:</span>
                    <span className="font-medium">{receipt.merchant_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Date:</span>
                    <span className="font-medium">
                      {receipt.transaction_date ? format(new Date(receipt.transaction_date), "MMM dd, yyyy") : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Amount:</span>
                    <span className="font-medium">
                      {receipt.original_total
                        ? `${receipt.original_total.toFixed(2)} ${receipt.original_currency}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Converted Amount:</span>
                    <span className="font-medium">
                      {receipt.converted_total
                        ? `${receipt.converted_total.toFixed(2)} ${receipt.base_currency}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={receipt.converted_total ? "default" : "secondary"}>
                      {receipt.converted_total ? "Converted" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Merchant Details */}
            {jsonData?.merchant_details && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Merchant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jsonData.merchant_details.name && (
                    <div>
                      <span className="text-gray-600 text-sm">Name:</span>
                      <p className="font-medium">{jsonData.merchant_details.name}</p>
                    </div>
                  )}
                  {jsonData.merchant_details.address && (
                    <div>
                      <span className="text-gray-600 text-sm">Address:</span>
                      <p className="font-medium">{jsonData.merchant_details.address}</p>
                    </div>
                  )}
                  {jsonData.merchant_details.phone && (
                    <div>
                      <span className="text-gray-600 text-sm">Phone:</span>
                      <p className="font-medium">{jsonData.merchant_details.phone}</p>
                    </div>
                  )}
                  {jsonData.merchant_details.website && (
                    <div>
                      <span className="text-gray-600 text-sm">Website:</span>
                      <p className="font-medium">{jsonData.merchant_details.website}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="structured" className="space-y-4">
            {jsonData ? (
              <div className="space-y-4">
                {/* Document Metadata */}
                {jsonData.document_metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Document Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(jsonData.document_metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                            <p className="font-medium">{String(value) || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Merchant Details */}
                {jsonData.merchant_details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Merchant Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(jsonData.merchant_details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                            <p className="font-medium">{String(value) || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Transaction Details */}
                {jsonData.transaction_details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(jsonData.transaction_details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                            <p className="font-medium">{String(value) || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Financial Summary */}
                {jsonData.financial_summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(jsonData.financial_summary).map(([key, value]) => {
                          if (key === "tax_details") return null // Handle separately
                          return (
                            <div key={key}>
                              <span className="text-gray-600 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                              <p className="font-medium">
                                {typeof value === "number" ? value.toFixed(2) : String(value) || "N/A"}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Line Items */}
                {jsonData.line_items && jsonData.line_items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {jsonData.line_items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{item.description || `Item ${index + 1}`}</p>
                              {item.quantity && <p className="text-sm text-gray-600">Qty: {item.quantity}</p>}
                            </div>
                            <div className="text-right">
                              {item.unit_price && (
                                <p className="text-sm text-gray-600">${item.unit_price.toFixed(2)} each</p>
                              )}
                              {item.total_price && <p className="font-medium">${item.total_price.toFixed(2)}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Details */}
                {jsonData.payment_details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(jsonData.payment_details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 text-sm capitalize">{key.replace(/_/g, " ")}:</span>
                            <p className="font-medium">
                              {typeof value === "number" ? value.toFixed(2) : String(value) || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {jsonData.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{jsonData.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">No structured data available</p>
                  <p className="text-sm text-gray-400">
                    The receipt may not have been processed yet or data extraction failed
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raw JSON Data</CardTitle>
                <CardDescription>Complete extracted data in JSON format</CardDescription>
              </CardHeader>
              <CardContent>
                {receipt.json_data ? (
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No raw data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
