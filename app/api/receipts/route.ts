import { NextResponse } from "next/server"
import { dbManager } from "@/lib/database"

export async function GET() {
  try {
    const receipts = await dbManager.getAllReceipts()
    return NextResponse.json(receipts)
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}
