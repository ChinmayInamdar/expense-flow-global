"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UploadSection } from "@/components/upload/upload-section"
import { ProcessingHistory } from "@/components/upload/processing-history"
import { useAuth } from "@/hooks/use-auth"
import { Upload, FileText, Zap } from "lucide-react"

export default function UploadPage() {
  const [baseCurrency, setBaseCurrency] = useState("INR")
  const [apiKey, setApiKey] = useState("demo-key")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }
  }, [isAuthenticated, router])

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Upload className="h-8 w-8 text-blue-600" />
            Upload Receipts
          </h1>
          <p className="text-lg text-gray-600">Upload your receipt images and let AI extract the data automatically.</p>
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">AI-Powered OCR</h3>
              <p className="text-sm text-blue-700">Extract data from any receipt format</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Batch Processing</h3>
              <p className="text-sm text-green-700">Upload multiple files at once</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Drag & Drop</h3>
              <p className="text-sm text-purple-700">Simple and intuitive interface</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Receipt Images</CardTitle>
                <CardDescription>
                  Drag and drop your receipt images or click to browse. Supports JPG, JPEG, and PNG formats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadSection apiKey={apiKey} baseCurrency={baseCurrency} onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          </div>

          {/* Processing History */}
          <div>
            <ProcessingHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}
