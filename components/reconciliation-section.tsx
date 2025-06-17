"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Receipt } from "@/lib/types"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface ReconciliationSectionProps {
  baseCurrency: string
  receipts: Receipt[]
  onReconciliationComplete: () => void
}

export function ReconciliationSection({
  baseCurrency,
  receipts,
  onReconciliationComplete,
}: ReconciliationSectionProps) {
  const [reconcileOption, setReconcileOption] = useState("pending")
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const { toast } = useToast()

  const pendingReceipts = receipts.filter(
    (r) =>
      (r.converted_total === null || r.base_currency !== baseCurrency) &&
      r.original_total !== null &&
      r.original_currency !== null &&
      r.transaction_date !== null,
  )

  const allEligibleReceipts = receipts.filter(
    (r) => r.original_total !== null && r.original_currency !== null && r.transaction_date !== null,
  )

  const getReceiptsToProcess = () => {
    return reconcileOption === "pending" ? pendingReceipts : allEligibleReceipts
  }

  const handleReconciliation = async () => {
    const receiptsToProcess = getReceiptsToProcess()

    if (receiptsToProcess.length === 0) {
      toast({
        title: "No Records to Process",
        description: "No records found that require reconciliation",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResults([])

    try {
      const response = await fetch("/api/reconcile-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptIds: receiptsToProcess.map((r) => r.id),
          baseCurrency,
          option: reconcileOption,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setResults(result.results || [])
        toast({
          title: "Reconciliation Complete",
          description: `Successfully processed ${receiptsToProcess.length} record(s)`,
        })
        onReconciliationComplete()
      } else {
        toast({
          title: "Reconciliation Error",
          description: result.error || "Failed to complete reconciliation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during reconciliation",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Reconciliation Options</h3>
        <RadioGroup value={reconcileOption} onValueChange={setReconcileOption}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending" className="flex-1">
              <div>
                <div className="font-medium">Only records needing initial conversion</div>
                <div className="text-sm text-muted-foreground">
                  Process records that haven't been converted to {baseCurrency} ({pendingReceipts.length} records)
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="flex-1">
              <div>
                <div className="font-medium">All eligible records</div>
                <div className="text-sm text-muted-foreground">
                  Re-reconcile all records with sufficient data to {baseCurrency} ({allEligibleReceipts.length} records)
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{pendingReceipts.length}</div>
              <div className="text-sm text-muted-foreground">Need Conversion</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{allEligibleReceipts.length}</div>
              <div className="text-sm text-muted-foreground">Eligible for Recon</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {receipts.filter((r) => r.converted_total !== null && r.base_currency === baseCurrency).length}
              </div>
              <div className="text-sm text-muted-foreground">Already Converted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={handleReconciliation}
        disabled={processing || getReceiptsToProcess().length === 0}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Running Reconciliation...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Reconciliation to {baseCurrency} ({getReceiptsToProcess().length} records)
          </>
        )}
      </Button>

      {/* Progress */}
      {processing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">Processing currency conversions...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reconciliation Results</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <Alert key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className="text-sm">{result.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Currency conversion uses historical exchange rates from the Frankfurter API. Rates are fetched based on the
          transaction date of each receipt.
        </AlertDescription>
      </Alert>
    </div>
  )
}
