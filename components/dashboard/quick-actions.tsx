"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload, FileText, RefreshCw, BarChart3 } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipts
          </Link>
        </Button>

        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/expenses">
            <FileText className="mr-2 h-4 w-4" />
            View Expenses
          </Link>
        </Button>

        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/reconcile">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconcile Currency
          </Link>
        </Button>

        <Button className="w-full justify-start" variant="outline" disabled>
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  )
}
