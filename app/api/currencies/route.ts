import { NextResponse } from "next/server"
import { fetchAvailableCurrencies } from "@/lib/currency"

export async function GET() {
  try {
    const result = await fetchAvailableCurrencies()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching currencies:", error)
    return NextResponse.json(
      {
        currencies: ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"],
        success: false,
      },
      { status: 500 },
    )
  }
}
