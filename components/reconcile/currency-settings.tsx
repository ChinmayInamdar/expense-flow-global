"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface CurrencySettingsProps {
  baseCurrency: string
  onBaseCurrencyChange: (currency: string) => void
}

export function CurrencySettings({ baseCurrency, onBaseCurrencyChange }: CurrencySettingsProps) {
  const [currencies, setCurrencies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
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
        // Update the fallback currencies to prioritize INR
        setCurrencies(["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"])
      }
    } catch (error) {
      // Also update the catch block fallback
      setCurrencies(["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"])
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyChange = (currency: string) => {
    onBaseCurrencyChange(currency)
    toast({
      title: "Base Currency Updated",
      description: `Base currency set to ${currency}`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="base-currency">Base Currency</Label>
        <Select value={baseCurrency} onValueChange={handleCurrencyChange} disabled={loading}>
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
        <p className="text-xs text-muted-foreground">All expenses will be converted to this currency</p>
      </div>

      <div className="pt-2">
        <Badge variant="outline" className="text-xs">
          Current: {baseCurrency}
        </Badge>
      </div>
    </div>
  )
}
