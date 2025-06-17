import { type NextRequest, NextResponse } from "next/server"
import { dbManager } from "@/lib/database"

export async function POST(request: NextRequest) {
  console.log("=== Avatar Upload API Called ===")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    console.log("Request data:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId,
    })

    if (!file || !userId) {
      console.log("Missing required data")
      return NextResponse.json({ success: false, error: "Missing file or user ID" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log("File too large:", file.size)
      return NextResponse.json({ success: false, error: "File size must be less than 2MB" }, { status: 400 })
    }

    console.log("Converting file to base64...")

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("Base64 conversion complete, length:", dataUrl.length)

    // Check if user exists
    const existingUser = await dbManager.getUserById(userId)
    if (!existingUser) {
      console.log("User not found:", userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("Updating user avatar in database...")

    // Update user avatar in database
    const updatedUser = await dbManager.updateUser(userId, { avatar: dataUrl })

    if (!updatedUser) {
      console.log("Failed to update user")
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    console.log("Avatar updated successfully for user:", userId)

    return NextResponse.json({
      success: true,
      avatarUrl: dataUrl,
      message: "Avatar uploaded successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    })
  } catch (error) {
    console.error("=== Avatar Upload Error ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
