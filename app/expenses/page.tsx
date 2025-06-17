"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ExpenseTable } from "@/components/expense-table"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { ExpenseStats } from "@/components/expenses/expense-stats"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Receipt } from "@/lib/types"
import { ReceiptIcon, Filter, BarChart3, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExpensesPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [baseCurrency] = useState("INR")
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }
    fetchData()
  }, [isAuthenticated, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/receipts")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched receipts:", data)
        setReceipts(data)
        setFilteredReceipts(data)
      } else {
        console.error("Failed to fetch receipts:", await response.text())
      }
    } catch (error) {
      console.error("Error fetching receipts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch("/api/debug")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        toast({
          title: "Debug Info Loaded",
          description: `Found ${data.receiptsCount} receipts in database`,
        })
      }
    } catch (error) {
      console.error("Error fetching debug info:", error)
    }
  }

  const handleDataUpdate = () => {
    fetchData()
  }

  const handleFilterChange = (filters: any) => {
    let filtered = [...receipts]

    if (filters.dateRange?.from) {
      filtered = filtered.filter((r) => new Date(r.transaction_date || r.upload_time) >= filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      filtered = filtered.filter((r) => new Date(r.transaction_date || r.upload_time) <= filters.dateRange.to)
    }
    if (filters.merchant) {
      filtered = filtered.filter((r) => r.merchant_name?.toLowerCase().includes(filters.merchant.toLowerCase()))
    }
    if (filters.currency && filters.currency !== "all") {
      filtered = filtered.filter((r) => r.original_currency === filters.currency)
    }
    if (filters.status && filters.status !== "all") {
      if (filters.status === "converted") {
        filtered = filtered.filter((r) => r.converted_total !== null)
      } else if (filters.status === "pending") {
        filtered = filtered.filter((r) => r.converted_total === null)
      }
    }

    setFilteredReceipts(filtered)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <ReceiptIcon className="h-8 w-8 text-blue-600" />
              Expense Management
            </h1>
            <p className="text-lg text-gray-600">View, filter, and manage all your recorded expenses.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={fetchDebugInfo} className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Info
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono">
                <p>Receipts in DB: {debugInfo.receiptsCount}</p>
                <p>Reconciliations: {debugInfo.reconciliationsCount}</p>
                <p>Next Receipt ID: {debugInfo.debugInfo?.nextReceiptId}</p>
                {debugInfo.receipts && debugInfo.receipts.length > 0 ? (
                  <div className="mt-2">
                    <p className="font-semibold">Recent Receipts:</p>
                    <ul className="list-disc pl-5">
                      {debugInfo.receipts.slice(0, 3).map((r: any) => (
                        <li key={r.id}>
                          ID: {r.id} - {r.file_name} - {r.merchant_name} - {r.original_total} {r.original_currency}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-red-500">No receipts found in database</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <ExpenseStats receipts={filteredReceipts} baseCurrency={baseCurrency} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>Filter your expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseFilters receipts={receipts} onFilterChange={handleFilterChange} />
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Expense Records ({filteredReceipts.length})
                </CardTitle>
                <CardDescription>Manage your expense records and perform bulk operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTable
                  receipts={filteredReceipts}
                  baseCurrency={baseCurrency}
                  onDataUpdate={handleDataUpdate}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
