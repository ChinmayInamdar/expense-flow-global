import { GoogleGenerativeAI } from "@google/generative-ai"

const JSON_TEMPLATE = {
  document_metadata: {
    file_name: null,
    processed_at: null,
    document_type: "receipt",
    expense_category: null,
    language: "en",
  },
  merchant_details: {
    name: null,
    address: null,
    phone: null,
    website: null,
    tax_id: null,
  },
  customer_details: {
    name: null,
    address: null,
    account_number: null,
  },
  transaction_details: {
    date: null,
    time: null,
    invoice_number: null,
    receipt_number: null,
    cashier: null,
    terminal_id: null,
  },
  line_items: [],
  financial_summary: {
    currency_code: null,
    subtotal: null,
    total_tax_amount: null,
    discount: null,
    rounding_adjustment: null,
    gratuity_tip: null,
    total_amount: null,
    tax_details: [],
  },
  payment_details: {
    method: null,
    card_type: null,
    card_last_four: null,
    amount_paid: null,
    change: null,
  },
  notes: null,
}

export async function processReceiptImage(apiKey: string, imageBuffer: Buffer, fileName: string) {
  if (!apiKey || apiKey === "demo-key") {
    // Return mock data for demo purposes
    const mockData = {
      merchant_name: "Demo Store",
      total_amount: Math.floor(Math.random() * 100) + 10,
      currency_code: "USD",
      date: new Date().toISOString().split("T")[0],
      category: "General",
    }

    return {
      ...JSON_TEMPLATE,
      document_metadata: {
        ...JSON_TEMPLATE.document_metadata,
        file_name: fileName,
        processed_at: new Date().toISOString(),
        expense_category: mockData.category,
      },
      merchant_details: {
        ...JSON_TEMPLATE.merchant_details,
        name: mockData.merchant_name,
      },
      transaction_details: {
        ...JSON_TEMPLATE.transaction_details,
        date: mockData.date,
        time: "12:30:00",
      },
      financial_summary: {
        ...JSON_TEMPLATE.financial_summary,
        currency_code: mockData.currency_code,
        total_amount: mockData.total_amount,
        subtotal: mockData.total_amount * 0.9,
        total_tax_amount: mockData.total_amount * 0.1,
      },
      notes: `Demo data generated for ${fileName}`,
    }
  }

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64")

    const prompt = `
You are an expert OCR system specialized in extracting structured data from receipt images. 
Analyze this receipt image and extract ALL available information into the following JSON structure.
Be as accurate and complete as possible. If a field is not visible or available, set it to null.

Required JSON structure:
{
  "document_metadata": {
    "file_name": "${fileName}",
    "processed_at": "${new Date().toISOString()}",
    "document_type": "receipt",
    "expense_category": "string (e.g., Food & Dining, Transportation, Office Supplies, etc.)",
    "language": "string"
  },
  "merchant_details": {
    "name": "string",
    "address": "string",
    "phone": "string", 
    "website": "string",
    "tax_id": "string"
  },
  "customer_details": {
    "name": "string",
    "address": "string",
    "account_number": "string"
  },
  "transaction_details": {
    "date": "YYYY-MM-DD format",
    "time": "HH:MM:SS format",
    "invoice_number": "string",
    "receipt_number": "string",
    "cashier": "string",
    "terminal_id": "string"
  },
  "line_items": [
    {
      "item_code": "string",
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "total_price": number
    }
  ],
  "financial_summary": {
    "currency_code": "3-letter currency code (USD, EUR, etc.)",
    "subtotal": number,
    "total_tax_amount": number,
    "discount": number,
    "rounding_adjustment": number,
    "gratuity_tip": number,
    "total_amount": number,
    "tax_details": [
      {
        "tax_code": "string",
        "tax_rate_percentage": number,
        "taxable_amount": number,
        "tax_amount": number
      }
    ]
  },
  "payment_details": {
    "method": "string (Cash, Credit Card, Debit Card, etc.)",
    "card_type": "string (Visa, Mastercard, etc.)",
    "card_last_four": "string",
    "amount_paid": number,
    "change": number
  },
  "notes": "string - any additional observations or extracted text"
}

IMPORTANT INSTRUCTIONS:
1. Extract ALL text visible in the image
2. Pay special attention to amounts, dates, and merchant information
3. For amounts, extract only the numeric value (no currency symbols)
4. For dates, convert to YYYY-MM-DD format
5. Categorize the expense based on the merchant type
6. Return ONLY valid JSON, no additional text or formatting
7. Ensure all numeric fields are actual numbers, not strings
8. If you cannot determine a value, use null (not empty string)

Analyze the receipt image now:
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Clean up the response to extract JSON
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Parse the JSON response
    const extractedData = JSON.parse(jsonText)

    // Validate and ensure required fields
    const validatedData = {
      ...JSON_TEMPLATE,
      ...extractedData,
      document_metadata: {
        ...JSON_TEMPLATE.document_metadata,
        ...extractedData.document_metadata,
        file_name: fileName,
        processed_at: new Date().toISOString(),
      },
    }

    console.log("Gemini API extraction successful:", validatedData)
    return validatedData
  } catch (error) {
    console.error("Gemini API error:", error)

    // Fallback to mock data if API fails
    const fallbackData = {
      ...JSON_TEMPLATE,
      document_metadata: {
        ...JSON_TEMPLATE.document_metadata,
        file_name: fileName,
        processed_at: new Date().toISOString(),
        expense_category: "General",
      },
      merchant_details: {
        ...JSON_TEMPLATE.merchant_details,
        name: "Unknown Merchant",
      },
      transaction_details: {
        ...JSON_TEMPLATE.transaction_details,
        date: new Date().toISOString().split("T")[0],
      },
      financial_summary: {
        ...JSON_TEMPLATE.financial_summary,
        currency_code: "USD",
        total_amount: 0,
      },
      notes: `API Error: ${error instanceof Error ? error.message : "Unknown error"}. File: ${fileName}`,
    }

    return fallbackData
  }
}
