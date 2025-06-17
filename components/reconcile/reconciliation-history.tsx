"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import type { ReconciliationRecord } from "@/lib/types"
import { Search, Download } from "lucide-react"
import { format } from "date-fns"

interface ReconciliationHistoryProps {
  reconciliations: ReconciliationRecord[]
  loading: boolean
}

export function ReconciliationHistory({ reconciliations, loading }: ReconciliationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReconciliations = useMemo(() => {
    if (!searchQuery) return reconciliations

    return reconciliations.filter(
      (record) =>
        record.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.original_currency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.base_currency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.status?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [reconciliations, searchQuery])

  const getStatusVariant = (status: string) => {
    if (status.toLowerCase().includes("success")) return "default"
    if (status.toLowerCase().includes("failed")) return "destructive"
    return "secondary"
  }

  const exportToCSV = () => {
    const headers = [
      "Reconciliation Time",
      "File Name",
      "Merchant",
      "Transaction Date",
      "Original Total",
      "Original Currency",
      "Target Currency",
      "Converted Total",
      "Exchange Rate",
      "Rate Source",
      "Status",
      "Notes",
    ]

    const csvContent = [
      headers.join(","),
      ...reconciliations.map((record) =>
        [
          record.reconciliation_time,
          `"${record.file_name || ""}"`,
          `"${record.merchant_name || ""}"`,
          record.transaction_date || "",
          record.original_total || "",
          record.original_currency || "",
          record.base_currency || "",
          record.converted_total || "",
          record.exchange_rate || "",
          `"${record.rate_source || ""}"`,
          `"${record.status || ""}"`,
          `"${record.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reconciliation_history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reconciliation history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Converted Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReconciliations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No reconciliation history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReconciliations.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {record.reconciliation_time
                          ? format(new Date(record.reconciliation_time), "MMM dd, HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-32 truncate" title={record.file_name}>
                        {record.file_name}
                      </TableCell>
                      <TableCell>{record.merchant_name || "N/A"}</TableCell>
                      <TableCell>
                        {record.original_total !== null
                          ? `${record.original_total.toFixed(2)} ${record.original_currency}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {record.converted_total !== null
                          ? `${record.converted_total.toFixed(2)} ${record.base_currency}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.exchange_rate !== null ? record.exchange_rate.toFixed(6) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(record.status || "")}>{record.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.rate_source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
