import { type NextRequest, NextResponse } from "next/server"
import { dbManager } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await dbManager.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const userData = {
      id: uuidv4(), // Generate UUID for new user
      name,
      email,
      avatar: "",
    }
    const user = await dbManager.createUser(userData)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Error signing up:", error)
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
  }
}
