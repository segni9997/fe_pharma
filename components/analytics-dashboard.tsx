"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { getDashboardStats, mockMedicines, mockCategories } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AnalyticsDashboardProps {
  onBack: () => void
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("7d")
  const stats = getDashboardStats()

  // Mock sales data for charts
  const salesTrendData = [
    { date: "Mon", sales: 1200, transactions: 45 },
    { date: "Tue", sales: 1800, transactions: 52 },
    { date: "Wed", sales: 1500, transactions: 38 },
    { date: "Thu", sales: 2200, transactions: 65 },
    { date: "Fri", sales: 2800, transactions: 78 },
    { date: "Sat", sales: 3200, transactions: 85 },
    { date: "Sun", sales: 2100, transactions: 58 },
  ]

  const categoryData = mockCategories.map((category) => {
    const categoryMedicines = mockMedicines.filter((med) => med.categoryId === category.id)
    const totalValue = categoryMedicines.reduce((sum, med) => sum + med.price * med.stockQuantity, 0)
    const totalStock = categoryMedicines.reduce((sum, med) => sum + med.stockQuantity, 0)

    return {
      name: category.name,
      value: totalValue,
      stock: totalStock,
      count: categoryMedicines.length,
    }
  })

  const topSellingData = [
    { name: "Paracetamol 500mg", sales: 450, revenue: 2697 },
    { name: "Vitamin D3 1000IU", sales: 280, revenue: 5317 },
    { name: "Amoxicillin 250mg", sales: 180, revenue: 2250 },
    { name: "Face Moisturizer SPF 30", sales: 120, revenue: 2999 },
    { name: "Ibuprofen 400mg", sales: 95, revenue: 760 },
  ]

  const stockAlertData = mockMedicines
    .map((medicine) => ({
      name: medicine.name,
      stock: medicine.stockQuantity,
      status: medicine.stockQuantity < 10 ? "Low" : medicine.stockQuantity < 50 ? "Medium" : "Good",
    }))
    .filter((item) => item.status === "Low")
    .slice(0, 5)

  const COLORS = ["#0891b2", "#f97316", "#dc2626", "#4b5563", "#10b981"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary">
              Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs">
              {user?.role.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.monthlySales.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">421</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +8.2% from last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Order Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24.67</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                -2.1% from last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +5.4% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>
                Daily sales performance over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales ($)",
                    color: "hsl(var(--chart-1))",
                  },
                  transactions: {
                    label: "Transactions",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-sales)"
                      strokeWidth={2}
                      name="Sales ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="transactions"
                      stroke="var(--color-transactions)"
                      strokeWidth={2}
                      name="Transactions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>
                Distribution of inventory value across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Value ($)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products by sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Units Sold",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>
                Products requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlertData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No stock alerts at this time
                  </p>
                ) : (
                  stockAlertData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Current stock: {item.stock} units
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {item.status} Stock
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                This Week Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Sales:</span>
                <span className="font-medium">
                  ${stats.weeklySales.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transactions:</span>
                <span className="font-medium">421</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Customers:</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Return Rate:</span>
                <span className="font-medium text-green-600">2.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Inventory Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Products:</span>
                <span className="font-medium">{stats.totalMedicines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low Stock:</span>
                <span className="font-medium text-red-600">
                  {stats.lowStockCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Near Expiry:</span>
                <span className="font-medium text-orange-600">
                  {stats.nearExpiryCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Expired:</span>
                <span className="font-medium text-red-600">
                  {stats.expiredCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Profit Margin:</span>
                <span className="font-medium text-green-600">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inventory Turnover:</span>
                <span className="font-medium">6.2x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customer Satisfaction:</span>
                <span className="font-medium text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Staff Efficiency:</span>
                <span className="font-medium text-green-600">87.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
