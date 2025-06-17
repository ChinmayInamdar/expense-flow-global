import { NextResponse } from "next/server"
import { dbManager } from "@/lib/database"

export async function GET() {
  try {
    const debugInfo = dbManager.debug()
    const receipts = await dbManager.getAllReceipts()
    const reconciliations = await dbManager.getReconciliationHistory()
    const users = await dbManager.getAllUsers()

    return NextResponse.json({
      success: true,
      debugInfo,
      receiptsCount: receipts.length,
      reconciliationsCount: reconciliations.length,
      usersCount: users.length,
      receipts: receipts.map((r) => ({
        id: r.id,
        file_name: r.file_name,
        merchant_name: r.merchant_name,
        original_currency: r.original_currency,
        original_total: r.original_total,
        base_currency: r.base_currency,
        converted_total: r.converted_total,
      })),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
