"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { User, Camera, Settings, Palette, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated, updateProfile, setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      console.log("Current user:", user)
    }
  }, [isAuthenticated, user, router])

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile({ name, email })
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePhotoClick = () => {
    console.log("Change photo button clicked")
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed")
    const file = e.target.files?.[0]

    if (!file) {
      console.log("No file selected")
      return
    }

    if (!user) {
      console.log("No user found")
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
        variant: "destructive",
      })
      return
    }

    console.log("Selected file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      userId: user.id,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type")
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF).",
        variant: "destructive",
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log("File too large")
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    setUploadingAvatar(true)
    setUploadProgress(10)

    try {
      console.log("Starting upload process...")

      // Create FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", user.id)

      console.log("FormData created, sending request...")
      setUploadProgress(30)

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)
      setUploadProgress(60)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Upload result:", result)
      setUploadProgress(90)

      if (result.success && result.user) {
        // Update user state immediately
        setUser(result.user)
        setUploadProgress(100)

        toast({
          title: "Avatar Uploaded",
          description: "Your profile picture has been updated successfully.",
        })

        console.log("Avatar updated successfully, new user state:", result.user)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAvatar = async () => {
    try {
      await updateProfile({ avatar: "" })
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      })
    } catch (error) {
      console.error("Remove avatar error:", error)
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      })
    }
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
            <User className="h-8 w-8 text-blue-600" />
            Profile & Settings
          </h1>
          <p className="text-lg text-gray-600">Manage your account settings and preferences.</p>
        </div>

        {/* Debug Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>
              <strong>User ID:</strong> {user?.id || "Not found"}
            </p>
            <p>
              <strong>User Name:</strong> {user?.name || "Not found"}
            </p>
            <p>
              <strong>Avatar:</strong> {user?.avatar ? `${user.avatar.substring(0, 50)}...` : "No avatar"}
            </p>
            <p>
              <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </p>
            <p>
              <strong>Uploading:</strong> {uploadingAvatar ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={name} />
                      <AvatarFallback className="text-2xl">{name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={uploadingAvatar}
                        onClick={handleChangePhotoClick}
                        type="button"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        {uploadingAvatar ? "Uploading..." : "Change Photo"}
                      </Button>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />

                      {user?.avatar && (
                        <Button variant="outline" onClick={removeAvatar} disabled={uploadingAvatar}>
                          Remove
                        </Button>
                      )}
                    </div>

                    {uploadingAvatar && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Uploading... {uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Supported formats:</strong> JPG, PNG, GIF
                        <br />
                        <strong>Maximum size:</strong> 2MB
                        <br />
                        <strong>Recommended:</strong> Square images work best (e.g., 400x400px)
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading || uploadingAvatar}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your interface theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">December 2024</p>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Export Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Picture Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Square images work best</strong>
                    <p className="text-gray-600">Use 400x400px or larger for crisp display</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Keep file size under 2MB</strong>
                    <p className="text-gray-600">Compress large images for faster uploads</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Use clear, professional photos</strong>
                    <p className="text-gray-600">Good lighting and focus make a difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
