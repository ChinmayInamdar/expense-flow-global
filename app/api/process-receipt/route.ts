import { type NextRequest, NextResponse } from "next/server"
import { processReceiptImage } from "@/lib/gemini"
import { dbManager } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const apiKey = formData.get("apiKey") as string
    const baseCurrency = formData.get("baseCurrency") as string

    if (!file || !apiKey || !baseCurrency) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Processing receipt: ${file.name}, API Key provided: ${!!apiKey}, Base Currency: ${baseCurrency}`)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process the image with Gemini API
    const extractedData = await processReceiptImage(apiKey, buffer, file.name)

    console.log("Extracted data:", {
      merchant: extractedData.merchant_details?.name,
      date: extractedData.transaction_details?.date,
      currency: extractedData.financial_summary?.currency_code,
      total: extractedData.financial_summary?.total_amount,
    })

    // Prepare data for database insertion
    const receiptData = {
      file_name: file.name,
      upload_time: new Date().toISOString(),
      merchant_name: extractedData.merchant_details?.name || null,
      transaction_date: extractedData.transaction_details?.date || null,
      original_currency: extractedData.financial_summary?.currency_code || null,
      original_total: extractedData.financial_summary?.total_amount || null,
      base_currency: baseCurrency,
      converted_total: null, // Will be set during reconciliation
      json_data: JSON.stringify(extractedData),
    }

    console.log("Inserting receipt data:", {
      file_name: receiptData.file_name,
      merchant_name: receiptData.merchant_name,
      original_currency: receiptData.original_currency,
      original_total: receiptData.original_total,
    })

    // Get current DB state before insertion
    const dbStateBefore = dbManager.debug()
    console.log("DB state before insertion:", dbStateBefore)

    // Insert into database
    const result = await dbManager.insertReceipt(receiptData)

    // Get DB state after insertion
    const dbStateAfter = dbManager.debug()
    console.log("DB state after insertion:", dbStateAfter)

    return NextResponse.json({
      success: true,
      data: extractedData,
      receiptId: result.lastID,
      dbState: dbStateAfter,
    })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        dbState: dbManager.debug(),
      },
      { status: 500 },
    )
  }
}
