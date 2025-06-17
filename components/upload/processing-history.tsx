"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Receipt } from "@/lib/types"
import { Clock, FileText } from "lucide-react"
import { format } from "date-fns"

interface ProcessingHistoryProps {
  refreshTrigger: number
}

export function ProcessingHistory({ refreshTrigger }: ProcessingHistoryProps) {
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentReceipts()
  }, [refreshTrigger])

  const fetchRecentReceipts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/receipts")
      if (response.ok) {
        const data = await response.json()
        setRecentReceipts(data.slice(0, 10)) // Show last 10 receipts
      }
    } catch (error) {
      console.error("Failed to fetch recent receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Processing History
        </CardTitle>
        <CardDescription>Recently processed receipts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No receipts processed yet</p>
              <p className="text-xs">Upload some receipts to see them here</p>
            </div>
          ) : (
            recentReceipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm truncate max-w-40" title={receipt.file_name}>
                    {receipt.file_name}
                  </p>
                  <p className="text-xs text-gray-500">{receipt.merchant_name || "Processing..."}</p>
                </div>
                <div className="text-right">
                  <Badge variant={receipt.original_total ? "default" : "secondary"} className="text-xs">
                    {receipt.original_total ? "Processed" : "Pending"}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(receipt.upload_time), "MMM dd, HH:mm")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
