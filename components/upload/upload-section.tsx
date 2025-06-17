"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, FileImage, Loader2, Key } from "lucide-react"
import Image from "next/image"

interface UploadSectionProps {
  apiKey: string
  baseCurrency: string
  onUploadComplete: () => void
}

interface UploadFile extends File {
  preview?: string
}

export function UploadSection({ apiKey: initialApiKey, baseCurrency, onUploadComplete }: UploadSectionProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localApiKey, setLocalApiKey] = useState(initialApiKey)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      }),
    )
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const processFiles = async () => {
    if (!localApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI Studio API Key to process receipts",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one image file to process",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(((i + 1) / files.length) * 100)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("apiKey", localApiKey)
        formData.append("baseCurrency", baseCurrency)

        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`)

        const response = await fetch("/api/process-receipt", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: `Processed ${file.name} successfully`,
          })
          console.log(`Successfully processed ${file.name}:`, result.data)
        } else {
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}: ${result.error}`,
            variant: "destructive",
          })
          console.error(`Failed to process ${file.name}:`, result.error)
        }
      }

      onUploadComplete()

      // Clear files after successful processing
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setFiles([])

      toast({
        title: "Batch Complete",
        description: `Processed ${files.length} file(s) successfully`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Error",
        description: "An error occurred during file processing",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Google AI Studio API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
              . Required for OCR processing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop receipt images here, or click to select</p>
            <p className="text-sm text-muted-foreground">Supports JPG, JPEG, PNG files</p>
          </div>
        )}
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selected Files ({files.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-3">
                  <div className="relative aspect-square mb-2">
                    <Image
                      src={file.preview! || "/placeholder.svg?height=150&width=150"}
                      alt={file.name}
                      fill
                      className="object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Process Button */}
      {files.length > 0 && (
        <div className="space-y-4">
          <Button onClick={processFiles} disabled={uploading || !localApiKey} className="w-full" size="lg">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing {files.length} file(s)...
              </>
            ) : (
              <>
                <FileImage className="mr-2 h-4 w-4" />
                Extract Data & Add {files.length} File(s) to Database
              </>
            )}
          </Button>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">{progress.toFixed(0)}% complete</p>
            </div>
          )}
        </div>
      )}

      {/* API Key Warning */}
      {!localApiKey && (
        <Alert>
          <AlertDescription>
            <strong>API Key Required:</strong> Please enter your Google AI Studio API Key above to enable real OCR
            processing.
            <br />
            Without an API key, the system will use demo/mock data for testing purposes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
