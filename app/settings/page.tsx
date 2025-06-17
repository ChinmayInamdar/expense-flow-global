"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Settings, Palette, Bell, Shield, Globe } from "lucide-react"

export default function SettingsPage() {
  // Change the default base currency from USD to INR
  const [baseCurrency, setBaseCurrency] = useState("INR")
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)
  const [autoReconcile, setAutoReconcile] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }
  }, [isAuthenticated, router])

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">Configure your ExpenseFlowGlobal preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Customize how ExpenseFlowGlobal looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium dark:text-slate-200">Theme</Label>
                  <p className="text-xs text-muted-foreground dark:text-slate-500">
                    Choose between light, dark, or system theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                <Globe className="h-5 w-5" />
                Currency & Localization
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Set your preferred currency and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-currency" className="dark:text-slate-200">
                  Base Currency
                </Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Manage how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium dark:text-slate-200">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground dark:text-slate-500">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium dark:text-slate-200">Email Updates</Label>
                  <p className="text-xs text-muted-foreground dark:text-slate-500">
                    Get weekly summaries and important updates
                  </p>
                </div>
                <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                <Shield className="h-5 w-5" />
                Automation & Security
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Configure automatic processes and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium dark:text-slate-200">Auto-Reconciliation</Label>
                  <p className="text-xs text-muted-foreground dark:text-slate-500">
                    Automatically convert currencies when receipts are uploaded
                  </p>
                </div>
                <Switch checked={autoReconcile} onCheckedChange={setAutoReconcile} />
              </div>

              <Separator className="dark:bg-slate-700" />

              <div className="space-y-2">
                <Label className="text-sm font-medium dark:text-slate-200">Data Retention</Label>
                <p className="text-xs text-muted-foreground dark:text-slate-500">
                  All transaction history is permanently stored for audit purposes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} size="lg" className="dark:bg-blue-600 dark:hover:bg-blue-700">
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
