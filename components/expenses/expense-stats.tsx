"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Receipt } from "@/lib/types"
import { Percent, Calendar, File } from "lucide-react"

interface ExpenseStatsProps {
  receipts: Receipt[]
  baseCurrency: string
}

export function ExpenseStats({ receipts, baseCurrency }: ExpenseStatsProps) {
  const processedReceipts = receipts.filter((r) => r.original_total !== null && r.original_currency !== null)
  const totalOriginal = processedReceipts.reduce((sum, r) => sum + (r.original_total || 0), 0)
  const totalConverted = processedReceipts.reduce((sum, r) => sum + (r.converted_total || 0), 0)
  const conversionRate =
    processedReceipts.length > 0
      ? (processedReceipts.filter((r) => r.converted_total !== null).length / processedReceipts.length) * 100
      : 0

  const thisMonth = processedReceipts.filter((r) => {
    const receiptDate = new Date(r.upload_time)
    const now = new Date()
    return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processed Records</CardTitle>
          <File className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processedReceipts.length}</div>
          <p className="text-xs text-muted-foreground">Successfully processed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Successfully converted</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonth}</div>
          <p className="text-xs text-muted-foreground">New receipts</p>
        </CardContent>
      </Card>
    </div>
  )
}
