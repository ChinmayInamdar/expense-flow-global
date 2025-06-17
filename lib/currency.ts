interface ExchangeRateResponse {
  rate: number | null
  status: string
}

export async function fetchHistoricalExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  date: string,
): Promise<ExchangeRateResponse> {
  if (!fromCurrency || !toCurrency || !date) {
    return { rate: null, status: "Failed - Missing Input Data" }
  }

  const from = fromCurrency.trim().toUpperCase()
  const to = toCurrency.trim().toUpperCase()

  if (from === to) {
    return { rate: 1.0, status: "Success - Same Currency" }
  }

  // Validate date format
  try {
    new Date(date).toISOString()
  } catch {
    return { rate: null, status: `Failed - Invalid Date Format: ${date}` }
  }

  const apiUrl = `https://api.frankfurter.app/${date}?from=${from}&to=${to}`

  try {
    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "ExpenseFlowGlobal/1.0" },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return { rate: null, status: `Failed - API Error: ${response.status}` }
    }

    const data = await response.json()
    const rate = data.rates?.[to]

    if (rate === undefined) {
      return {
        rate: null,
        status: `Failed - Rate not found for ${from} to ${to} on ${date}`,
      }
    }

    return { rate: Number.parseFloat(rate), status: "Success" }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { rate: null, status: "Failed - API Timeout" }
      }
      return { rate: null, status: `Failed - API Error: ${error.message}` }
    }
    return { rate: null, status: "Failed - Unknown Error" }
  }
}

export async function fetchAvailableCurrencies(): Promise<{ currencies: string[]; success: boolean }> {
  try {
    const response = await fetch("https://api.frankfurter.app/currencies", {
      headers: { "User-Agent": "ExpenseFlowGlobal/1.0" },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const currencies = Object.keys(data).sort()

    // Ensure common currencies are included
    const commonCurrencies = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"]
    const allCurrencies = [...new Set([...commonCurrencies, ...currencies])].sort()

    return { currencies: allCurrencies, success: true }
  } catch (error) {
    // Fallback currencies
    const fallbackCurrencies = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "MYR", "SGD", "THB"]
    return { currencies: fallbackCurrencies, success: false }
  }
}
