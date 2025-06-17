"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Receipt } from "@/lib/types"
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ReceiptDetailsModal } from "@/components/receipt-details-modal"

interface ExpenseTableProps {
  receipts: Receipt[]
  baseCurrency: string
  onDataUpdate: () => void
  loading: boolean
}

export function ExpenseTable({ receipts, baseCurrency, onDataUpdate, loading }: ExpenseTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const filteredReceipts = useMemo(() => {
    if (!searchQuery) return receipts

    return receipts.filter(
      (receipt) =>
        receipt.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.original_currency?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [receipts, searchQuery])

  const paginatedReceipts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredReceipts.slice(startIndex, startIndex + pageSize)
  }, [filteredReceipts, currentPage, pageSize])

  const totalPages = Math.ceil(filteredReceipts.length / pageSize)

  const getReconciliationStatus = (receipt: Receipt) => {
    if (receipt.converted_total !== null && receipt.base_currency === baseCurrency) {
      return { status: "Converted", variant: "default" as const }
    } else if (
      receipt.original_total !== null &&
      receipt.original_currency !== null &&
      receipt.transaction_date !== null
    ) {
      return { status: "Needs Recon", variant: "secondary" as const }
    } else {
      return { status: "Missing Data", variant: "destructive" as const }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedReceipts.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }

  const handleBulkReconciliation = async () => {
    if (selectedIds.length === 0) return

    setProcessing(true)
    try {
      const response = await fetch("/api/reconcile-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptIds: selectedIds,
          baseCurrency,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Reconciliation Complete",
          description: `Successfully reconciled ${selectedIds.length} record(s)`,
        })
        setSelectedIds([])
        onDataUpdate()
      } else {
        toast({
          title: "Reconciliation Error",
          description: result.error || "Failed to reconcile selected records",
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
    }
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "File Name",
      "Merchant",
      "Transaction Date",
      "Original Total",
      "Original Currency",
      "Converted Total",
      "Base Currency",
    ]

    const csvContent = [
      headers.join(","),
      ...receipts.map((receipt) =>
        [
          receipt.id,
          `"${receipt.file_name || ""}"`,
          `"${receipt.merchant_name || ""}"`,
          receipt.transaction_date || "",
          receipt.original_total || "",
          receipt.original_currency || "",
          receipt.converted_total || "",
          receipt.base_currency || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "expenses.csv"
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
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          {selectedIds.length > 0 && (
            <Button onClick={handleBulkReconciliation} disabled={processing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${processing ? "animate-spin" : ""}`} />
              Reconcile Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === paginatedReceipts.length && paginatedReceipts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Converted Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No expenses found. Upload some receipts to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((receipt) => {
                  const { status, variant } = getReconciliationStatus(receipt)
                  return (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(receipt.id)}
                          onCheckedChange={(checked) => handleSelectRow(receipt.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{status}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <ReceiptDetailsModal receipt={receipt}>
                          <Button
                            variant="ghost"
                            className="p-0 h-auto font-medium text-left justify-start hover:text-blue-600"
                          >
                            <span className="truncate max-w-48" title={receipt.file_name}>
                              {receipt.file_name}
                            </span>
                          </Button>
                        </ReceiptDetailsModal>
                      </TableCell>
                      <TableCell>{receipt.merchant_name || "N/A"}</TableCell>
                      <TableCell>
                        {receipt.transaction_date ? format(new Date(receipt.transaction_date), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {receipt.original_total !== null
                          ? `${receipt.original_total.toFixed(2)} ${receipt.original_currency}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {receipt.converted_total !== null
                          ? `${receipt.converted_total.toFixed(2)} ${receipt.base_currency}`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredReceipts.length)}{" "}
              of {filteredReceipts.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
