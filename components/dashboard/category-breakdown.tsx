"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Receipt } from "@/lib/types"
import { PieChart, ShoppingCart, Car, Utensils, Zap } from "lucide-react"

interface CategoryBreakdownProps {
  receipts: Receipt[]
}

export function CategoryBreakdown({ receipts }: CategoryBreakdownProps) {
  const categoryData = useMemo(() => {
    // Extract categories from receipts and calculate totals
    const categories = receipts.reduce(
      (acc, receipt) => {
        // Try to extract category from JSON data or use merchant name to guess
        let category = "Other"

        try {
          if (receipt.json_data) {
            const jsonData = JSON.parse(receipt.json_data)
            category = jsonData.document_metadata?.expense_category || "Other"
          } else if (receipt.merchant_name) {
            // Simple categorization based on merchant name
            const merchant = receipt.merchant_name.toLowerCase()
            if (
              merchant.includes("starbucks") ||
              merchant.includes("mcdonald") ||
              merchant.includes("restaurant") ||
              merchant.includes("cafe")
            ) {
              category = "Food & Dining"
            } else if (
              merchant.includes("shell") ||
              merchant.includes("gas") ||
              merchant.includes("fuel") ||
              merchant.includes("uber") ||
              merchant.includes("taxi")
            ) {
              category = "Transportation"
            } else if (
              merchant.includes("walmart") ||
              merchant.includes("grocery") ||
              merchant.includes("supermarket")
            ) {
              category = "Groceries"
            } else if (
              merchant.includes("electric") ||
              merchant.includes("utility") ||
              merchant.includes("water") ||
              merchant.includes("internet")
            ) {
              category = "Utilities"
            }
          }
        } catch (error) {
          // Fallback to Other if JSON parsing fails
        }

        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 }
        }

        acc[category].amount += receipt.converted_total || receipt.original_total || 0
        acc[category].count += 1

        return acc
      },
      {} as Record<string, { amount: number; count: number }>,
    )

    const total = Object.values(categories).reduce((sum, cat) => sum + cat.amount, 0)

    return Object.entries(categories)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 categories
  }, [receipts])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food & Dining":
        return <Utensils className="h-4 w-4" />
      case "Transportation":
        return <Car className="h-4 w-4" />
      case "Groceries":
        return <ShoppingCart className="h-4 w-4" />
      case "Utilities":
        return <Zap className="h-4 w-4" />
      default:
        return <PieChart className="h-4 w-4" />
    }
  }

  const getCategoryColor = (index: number) => {
    const colors = ["blue", "green", "purple", "orange", "red"]
    return colors[index % colors.length]
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
          <CardDescription>Expenses by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expense categories yet</p>
            <p className="text-sm">Upload receipts to see category breakdown</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
        <CardDescription>Your top spending categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryData.map((category, index) => {
            const color = getCategoryColor(index)
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                      <div className={`text-${color}-600`}>{getCategoryIcon(category.name)}</div>
                    </div>
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <div className="text-xs text-gray-500">{category.count} receipts</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${category.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            )
          })}

          {categoryData.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No categorized expenses yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
