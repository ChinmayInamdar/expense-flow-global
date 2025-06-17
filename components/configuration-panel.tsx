"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Settings, Key, Globe, AlertCircle } from "lucide-react"

interface ConfigurationPanelProps {
  baseCurrency: string
  onBaseCurrencyChange: (currency: string) => void
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function ConfigurationPanel({
  baseCurrency,
  onBaseCurrencyChange,
  apiKey,
  onApiKeyChange,
}: ConfigurationPanelProps) {
  const [currencies, setCurrencies] = useState<string[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrencies()
  }, [])

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/currencies")
      const data = await response.json()

      if (data.success) {
        setCurrencies(data.currencies)
      } else {
        // Fallback currencies
        setCurrencies(["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"])
        toast({
          title: "Currency API Warning",
          description: "Using fallback currency list",
          variant: "destructive",
        })
      }
    } catch (error) {
      setCurrencies(["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"])
      toast({
        title: "Currency API Error",
        description: "Failed to fetch currencies, using fallback list",
        variant: "destructive",
      })
    } finally {
      setLoadingCurrencies(false)
    }
  }

  const handleCurrencyChange = (currency: string) => {
    onBaseCurrencyChange(currency)
    toast({
      title: "Base Currency Updated",
      description: `Base currency set to ${currency}`,
    })
  }

  const handleApiKeyChange = (key: string) => {
    onApiKeyChange(key)
    if (key) {
      toast({
        title: "API Key Updated",
        description: "Google AI Studio API key has been set",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>Configure your base currency and API settings</CardDescription>
        </CardHeader>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-4 w-4" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-currency">Base Currency</Label>
            <Select value={baseCurrency} onValueChange={handleCurrencyChange} disabled={loadingCurrencies}>
              <SelectTrigger id="base-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All expenses will be converted to this currency during reconciliation
            </p>
          </div>

          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Current: {baseCurrency}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-4 w-4" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Google AI Studio API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for OCR extraction. Get your key from{" "}
              <a
                href="https://makersuite.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {apiKey && (
            <Badge variant="default" className="text-xs">
              API Key Configured ✓
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Historical Rates:</strong> Currency conversion uses api.frankfurter.app
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Data Storage:</strong> All data is stored locally in your database
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Privacy:</strong> API keys are session-only and not stored persistently
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {!apiKey && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please configure your Google AI Studio API Key to enable receipt processing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
