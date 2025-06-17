export interface Receipt {
  id: number
  file_name: string
  upload_time: string
  merchant_name?: string
  transaction_date?: string
  original_currency?: string
  original_total?: number
  base_currency?: string
  converted_total?: number
  json_data?: string
}

export interface ReconciliationRecord {
  id: number
  receipt_id: number
  reconciliation_time: string
  transaction_date?: string
  original_currency?: string
  original_total?: number
  base_currency?: string
  converted_total?: number
  exchange_rate?: number
  rate_source?: string
  status?: string
  notes?: string
  file_name?: string
  merchant_name?: string
}

export interface ExtractedData {
  document_metadata: {
    file_name?: string
    processed_at?: string
    document_type?: string
    expense_category?: string
    language?: string
  }
  merchant_details: {
    name?: string
    address?: string
    phone?: string
    website?: string
    tax_id?: string
  }
  customer_details: {
    name?: string
    address?: string
    account_number?: string
  }
  transaction_details: {
    date?: string
    time?: string
    invoice_number?: string
    receipt_number?: string
    cashier?: string
    terminal_id?: string
  }
  line_items: Array<{
    item_code?: string
    description?: string
    quantity?: number
    unit_price?: number
    total_price?: number
  }>
  financial_summary: {
    currency_code?: string
    subtotal?: number
    total_tax_amount?: number
    discount?: number
    rounding_adjustment?: number
    gratuity_tip?: number
    total_amount?: number
    tax_details: Array<{
      tax_code?: string
      tax_rate_percentage?: number
      taxable_amount?: number
      tax_amount?: number
    }>
  }
  payment_details: {
    method?: string
    card_type?: string
    card_last_four?: string
    amount_paid?: number
    change?: number
  }
  notes?: string
}
