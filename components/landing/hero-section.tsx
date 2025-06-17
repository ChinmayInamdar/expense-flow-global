import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Zap, Shield, Globe } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Expense Management
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Expense Management
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Upload receipt images and let AI extract data automatically. Convert currencies, reconcile expenses, and
                gain insights with our intelligent expense management platform.
              </p>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">AI-Powered OCR</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Multi-Currency Support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-gray-700">Real-time Processing</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="text-sm text-gray-500">Trusted by businesses worldwide</div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/images/hero-image.png"
                alt="ExpenseFlowGlobal - Expense Reconciliation Made Easy"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl"
                priority
              />

              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Receipt Processed</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Starbucks - $15.75</div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Currency Converted</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">€45.20 → $48.95</div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl transform rotate-3 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
