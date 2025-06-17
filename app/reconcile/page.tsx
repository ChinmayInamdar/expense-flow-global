"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReconciliationSection } from "@/components/reconciliation-section"
import { ReconciliationHistory } from "@/components/reconcile/reconciliation-history"
import { CurrencySettings } from "@/components/reconcile/currency-settings"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Receipt, ReconciliationRecord } from "@/lib/types"
import { RefreshCw, History, Settings } from "lucide-react"

export default function ReconcilePage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])
  const [baseCurrency, setBaseCurrency] = useState("INR")
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
        description: "Failed to fetch reconciliation data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReconciliationComplete = () => {
    fetchData()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            Currency Reconciliation
          </h1>
          <p className="text-lg text-gray-600">
            Convert your expenses to a unified base currency using historical exchange rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Currency Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencySettings baseCurrency={baseCurrency} onBaseCurrencyChange={setBaseCurrency} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Reconciliation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Run Reconciliation</CardTitle>
                <CardDescription>
                  Convert expense totals to your base currency ({baseCurrency}) using historical rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationSection
                  baseCurrency={baseCurrency}
                  receipts={receipts}
                  onReconciliationComplete={handleReconciliationComplete}
                />
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Reconciliation History
                </CardTitle>
                <CardDescription>Detailed log of all currency conversion attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationHistory reconciliations={reconciliations} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
