import { NextResponse } from "next/server"
import { dbManager } from "@/lib/database"

export async function GET() {
  try {
    const reconciliations = await dbManager.getReconciliationHistory()
    return NextResponse.json(reconciliations)
  } catch (error) {
    console.error("Error fetching reconciliations:", error)
    return NextResponse.json({ error: "Failed to fetch reconciliation history" }, { status: 500 })
  }
}
