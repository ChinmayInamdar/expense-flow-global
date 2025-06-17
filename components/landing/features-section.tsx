import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Globe, BarChart3, Shield, Upload, RefreshCw, FileText } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "AI-Powered OCR",
    description: "Advanced AI extracts data from any receipt format with 99% accuracy",
    badge: "AI-Powered",
    color: "blue",
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description: "Automatic currency conversion with real-time historical exchange rates",
    badge: "Global",
    color: "green",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Comprehensive insights and visualizations for better expense tracking",
    badge: "Analytics",
    color: "purple",
  },
  {
    icon: Upload,
    title: "Batch Processing",
    description: "Upload multiple receipts at once with drag-and-drop interface",
    badge: "Efficient",
    color: "orange",
  },
  {
    icon: RefreshCw,
    title: "Auto Reconciliation",
    description: "Automated currency reconciliation with detailed audit trails",
    badge: "Automated",
    color: "red",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with encrypted data storage and processing",
    badge: "Secure",
    color: "gray",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <FileText className="w-3 h-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              expense management
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered data extraction to multi-currency reconciliation, ExpenseFlow provides all the tools you
            need to streamline your expense workflow.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${feature.color}-400 to-${feature.color}-600`}
                />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
