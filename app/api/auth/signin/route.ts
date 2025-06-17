import { type NextRequest, NextResponse } from "next/server"
import { dbManager } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user exists
    let user = await dbManager.getUserByEmail(email)

    // For demo purposes, create user if doesn't exist
    if (!user) {
      const userData = {
        id: uuidv4(), // Generate UUID for new user
        name: email === "demo@expenseflow.com" ? "Demo User" : "John Doe",
        email,
        avatar: "",
      }
      user = await dbManager.createUser(userData)
    }

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
    console.error("Error signing in:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
