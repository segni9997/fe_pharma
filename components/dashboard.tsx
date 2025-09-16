"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { getDashboardStats, getTopSellingMedicines } from "@/lib/data"
import { MedicineManagement } from "@/components/medicine-management"
import { POSSystem } from "@/components/pos-system"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Package, AlertTriangle, Calendar, DollarSign, Users, LogOut } from "lucide-react"

type DashboardView = "main" | "medicines" | "pos" | "reports"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<DashboardView>("main")
  const stats = getDashboardStats()
  const topSellingMedicines = getTopSellingMedicines()

  const handleLogout = () => {
    logout()
  }

  if (currentView === "medicines") {
    return <MedicineManagement onBack={() => setCurrentView("main")} />
  }

  if (currentView === "pos") {
    return <POSSystem onBack={() => setCurrentView("main")} />
  }

  if (currentView === "reports") {
    return <AnalyticsDashboard onBack={() => setCurrentView("main")} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">PharmaCare</h1>
            <Badge variant="secondary" className="text-xs">
              {user?.role.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your pharmacy operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.todaySales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMedicines}</div>
              <p className="text-xs text-muted-foreground">Active inventory items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Items below 10 units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.nearExpiryCount}</div>
              <p className="text-xs text-muted-foreground">Expiring in 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Medicines</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.expiredCount}</div>
              <p className="text-xs text-muted-foreground">Already expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView("medicines")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Medicine Management
              </CardTitle>
              <CardDescription>Add, edit, and manage your medicine inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Medicines</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("pos")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Point of Sale
              </CardTitle>
              <CardDescription>Process sales and generate receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open POS</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("reports")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>View sales reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Reports</Button>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Medicines Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Top Selling Medicines</h3>
          {topSellingMedicines.length === 0 ? (
            <p className="text-muted-foreground">No sales data available.</p>
          ) : (
            <div className="space-y-4">
              {topSellingMedicines.map((medicine, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-md hover:shadow-md transition-shadow"
                >
                  <span className="font-medium">{medicine.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Sold: {medicine.sales} units | Revenue: ${medicine.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
