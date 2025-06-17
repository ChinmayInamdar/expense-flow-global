"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Receipt, ReconciliationRecord } from "@/lib/types"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { Header } from "@/components/layout/header"

export default function ExpenseFlowGlobal() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])
  const [baseCurrency, setBaseCurrency] = useState("INR")
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

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
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDataUpdate = () => {
    fetchData()
  }

  const stats = {
    totalReceipts: receipts.length,
    totalAmount: receipts.reduce((sum, receipt) => sum + (receipt.original_total || 0), 0),
    convertedReceipts: receipts.filter((r) => r.converted_total !== null).length,
    pendingReconciliation: receipts.filter(
      (r) =>
        r.converted_total === null &&
        r.original_total !== null &&
        r.original_currency !== null &&
        r.transaction_date !== null,
    ).length,
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with ExpenseFlow in just three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Receipts</h3>
                <p className="text-gray-600">Simply drag and drop your receipt images or click to browse</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Extraction</h3>
                <p className="text-gray-600">Our AI automatically extracts all relevant data from your receipts</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Reconcile & Analyze</h3>
                <p className="text-gray-600">Convert currencies and gain insights from your expense data</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Expense Management?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of businesses already using ExpenseFlow</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and Description */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">EF</span>
                  </div>
                  <span className="text-xl font-bold">ExpenseFlow</span>
                  <Badge variant="secondary" className="text-xs">
                    Global
                  </Badge>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  Transform your expense management with AI-powered OCR, multi-currency support, and intelligent
                  automation.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2024 ExpenseFlow Global. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
