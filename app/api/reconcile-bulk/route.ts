import { type NextRequest, NextResponse } from "next/server"
import { dbManager } from "@/lib/database"
import { fetchHistoricalExchangeRate } from "@/lib/currency"

export async function POST(request: NextRequest) {
  try {
    const { receiptIds, baseCurrency } = await request.json()

    if (!receiptIds || !Array.isArray(receiptIds) || !baseCurrency) {
      return NextResponse.json({ success: false, error: "Invalid request data" }, { status: 400 })
    }

    const results = []

    for (const receiptId of receiptIds) {
      try {
        const receipt = await dbManager.getReceiptById(receiptId)

        if (!receipt) {
          results.push({
            receiptId,
            success: false,
            message: `Receipt ID ${receiptId} not found`,
          })
          continue
        }

        const { original_total, original_currency, transaction_date } = receipt

        if (!original_total || !original_currency || !transaction_date) {
          results.push({
            receiptId,
            success: false,
            message: `Receipt ID ${receiptId} missing required data`,
          })
          continue
        }

        // Get exchange rate
        const { rate, status } = await fetchHistoricalExchangeRate(original_currency, baseCurrency, transaction_date)

        const reconciliationTime = new Date().toISOString()

        if (rate !== null && status.includes("Success")) {
          const convertedTotal = original_total * rate

          // Update receipt
          await dbManager.updateReceiptConversion(receiptId, convertedTotal, baseCurrency)

          // Log reconciliation
          await dbManager.insertReconciliation({
            receipt_id: receiptId,
            reconciliation_time: reconciliationTime,
            transaction_date,
            original_currency,
            original_total,
            base_currency: baseCurrency,
            converted_total: convertedTotal,
            exchange_rate: rate,
            rate_source: "Frankfurter API",
            status: "Success",
            notes: status,
          })

          results.push({
            receiptId,
            success: true,
            message: `Converted ${original_total} ${original_currency} to ${convertedTotal.toFixed(2)} ${baseCurrency}`,
          })
        } else {
          // Log failed reconciliation
          await dbManager.insertReconciliation({
            receipt_id: receiptId,
            reconciliation_time: reconciliationTime,
            transaction_date,
            original_currency,
            original_total,
            base_currency: baseCurrency,
            converted_total: null,
            exchange_rate: null,
            rate_source: "Frankfurter API",
            status: status,
            notes: status,
          })

          results.push({
            receiptId,
            success: false,
            message: `Failed to convert: ${status}`,
          })
        }
      } catch (error) {
        results.push({
          receiptId,
          success: false,
          message: `Error processing receipt: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error in bulk reconciliation:", error)
    return NextResponse.json({ success: false, error: "Failed to process bulk reconciliation" }, { status: 500 })
  }
}
