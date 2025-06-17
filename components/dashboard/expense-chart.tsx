"use client"

import { useMemo } from "react"
import type { Receipt } from "@/lib/types"
import { BarChart3, TrendingUp } from "lucide-react"

interface ExpenseChartProps {
  receipts: Receipt[]
}

export function ExpenseChart({ receipts }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    // Group receipts by month
    const monthlyData = receipts.reduce(
      (acc, receipt) => {
        const date = new Date(receipt.transaction_date || receipt.upload_time)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthName = date.toLocaleDateString("en-US", { month: "short" })

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthName,
            amount: 0,
            count: 0,
          }
        }

        acc[monthKey].amount += receipt.converted_total || receipt.original_total || 0
        acc[monthKey].count += 1

        return acc
      },
      {} as Record<string, { month: string; amount: number; count: number }>,
    )

    // Get last 6 months of data
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }, [receipts])

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1)

  if (receipts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No expense data yet</p>
        <p className="text-sm">Upload some receipts to see your spending trends</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="flex items-end justify-between h-64 gap-2 px-4">
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                style={{
                  height: `${Math.max((data.amount / maxAmount) * 200, 8)}px`,
                }}
                title={`${data.month}: $${data.amount.toFixed(2)} (${data.count} receipts)`}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${data.amount.toFixed(2)}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 font-medium">{data.month}</div>
            <div className="text-xs text-gray-500">{data.count} receipts</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Last 6 months trend</span>
        </div>
        <div>Total: ${chartData.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</div>
      </div>
    </div>
  )
}
