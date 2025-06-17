"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Receipt, ReconciliationRecord } from "@/lib/types"
import { BarChart3, Calendar } from "lucide-react"
// import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])
  const [loading, setLoading] = useState(true)
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
      const [receiptsRes, reconciliationsRes] = await Promise.all([
        fetch("/api/receipts"),
        fetch("/api/reconciliations"),
      ])

      if (receiptsRes.ok) {
        const receiptsData = await receiptsRes.json()
        setReceipts(receiptsData)
      }

      if (reconciliationsRes.ok) {
        const reconciliationsData = await reconciliationsRes.json()
        setReconciliations(reconciliationsData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalReceipts: receipts.length,
    convertedReceipts: receipts.filter((r) => r.converted_total !== null).length,
    pendingReconciliation: receipts.filter(
      (r) =>
        r.converted_total === null &&
        r.original_total !== null &&
        r.original_currency !== null &&
        r.transaction_date !== null,
    ).length,
    thisMonth: receipts.filter((r) => {
      const receiptDate = new Date(r.upload_time)
      const now = new Date()
      return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear()
    }).length,
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">Here's your expense management overview.</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  <BarChart3 className="h-5 w-5" />
                  Expense Trends
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Your spending patterns over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart receipts={receipts} />
              </CardContent>
            </Card>

            {/* <CategoryBreakdown receipts={receipts} /> */}
          </div>

          {/* Right Column - Activity & Actions */}
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity receipts={receipts.slice(0, 5)} />

            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  <Calendar className="h-5 w-5" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Receipts Processed</span>
                  <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">
                    {stats.thisMonth}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Pending Reconciliation</span>
                  <Badge variant="destructive">{stats.pendingReconciliation}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Conversion Rate</span>
                  <Badge variant="default" className="dark:bg-blue-600 dark:text-white">
                    {stats.totalReceipts > 0 ? ((stats.convertedReceipts / stats.totalReceipts) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
