"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Receipt } from "@/lib/types"
import { X } from "lucide-react"

interface ExpenseFiltersProps {
  receipts: Receipt[]
  onFilterChange: (filters: any) => void
}

export function ExpenseFilters({ receipts, onFilterChange }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState({
    merchant: "",
    currency: "all",
    status: "all",
    dateRange: { from: "", to: "" },
  })

  const currencies = [...new Set(receipts.map((r) => r.original_currency).filter(Boolean))]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      merchant: "",
      currency: "all",
      status: "all",
      dateRange: { from: "", to: "" },
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="space-y-4">
      {/* Merchant Filter */}
      <div className="space-y-2">
        <Label htmlFor="merchant">Merchant</Label>
        <Input
          id="merchant"
          placeholder="Search by merchant..."
          value={filters.merchant}
          onChange={(e) => handleFilterChange("merchant", e.target.value)}
        />
      </div>

      {/* Currency Filter */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={filters.currency} onValueChange={(value) => handleFilterChange("currency", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            {currencies.map((currency) => (
              <SelectItem key={currency} value={currency!}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="space-y-2">
          <Input
            type="date"
            value={filters.dateRange.from}
            onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, from: e.target.value })}
          />
          <Input
            type="date"
            value={filters.dateRange.to}
            onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, to: e.target.value })}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  )
}
