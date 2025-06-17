"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, DollarSign, RefreshCw, AlertTriangle } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalReceipts: number
    totalAmount: number
    convertedReceipts: number
    pendingReconciliation: number
  }
  baseCurrency: string
}

export function StatsCards({ stats, baseCurrency }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReceipts}</div>
          <p className="text-xs text-muted-foreground">Uploaded and processed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Original currency values</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Converted</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.convertedReceipts}</div>
          <p className="text-xs text-muted-foreground">Successfully reconciled to {baseCurrency}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingReconciliation}</div>
          <p className="text-xs text-muted-foreground">Need reconciliation</p>
        </CardContent>
      </Card>
    </div>
  )
}
