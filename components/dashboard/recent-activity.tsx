"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Receipt } from "@/lib/types"
import { Clock, ReceiptIcon } from "lucide-react"
import { format } from "date-fns"

interface RecentActivityProps {
  receipts: Receipt[]
}

export function RecentActivity({ receipts }: RecentActivityProps) {
  const recentReceipts = receipts.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest processed receipts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ReceiptIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Upload some receipts to get started</p>
            </div>
          ) : (
            recentReceipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ReceiptIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-32" title={receipt.file_name}>
                      {receipt.file_name}
                    </p>
                    <p className="text-xs text-gray-500">{receipt.merchant_name || "Unknown merchant"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {receipt.original_total ? `$${receipt.original_total.toFixed(2)}` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">{format(new Date(receipt.upload_time), "MMM dd")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
