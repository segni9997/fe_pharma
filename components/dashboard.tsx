"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { getDashboardStats, getTopSellingMedicines } from "@/lib/data"
import { MedicineManagement } from "@/components/medicine-management"
import { POSSystem } from "@/components/pos-system"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { UserManagement } from "@/components/user-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Package, AlertTriangle, Calendar, DollarSign, Users, LogOut, Currency } from "lucide-react"

type DashboardView = "main" | "medicines" | "pos" | "reports" | "users"

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

  if (currentView === "users") {
    return <UserManagement onBack={() => setCurrentView("main")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-r bg-background">
      {/* Header */}
      <header className="border-b bg-primary shadow-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-primary-foreground tracking-wide">PharmaCare</h1>
            {/* <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
              {user?.role.toUpperCase()}
            </Badge> */}
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:flex text-base text-primary-foreground font-semibold">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary-foreground bg-primary text-primary-foreground hover:bg-secondary/80 hover:text-primary-foreground/90 transition">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 md:max-w-8xl w-full mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-foreground mb-2">Dashboard</h2>
          <p className="text-foreground/80 text-lg">Overview of your pharmacy operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-10">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Today's Sales</CardTitle>
              <Currency className="h-5 w-5 text-primary-foreground opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold"><strong>Birr </strong>{stats.todaySales.toFixed(2)}</div>
              <p className="text-xs opacity-80">+20.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Medicines</CardTitle>
              <Package className="h-5 w-5 text-secondary-foreground opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{stats.totalMedicines}</div>
              <p className="text-xs opacity-80">Active inventory items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-300 text-destructive-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive-foreground opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{stats.lowStockCount}</div>
              <p className="text-xs opacity-80">Items below 10 units</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Near Expiry</CardTitle>
              <Calendar className="h-5 w-5 text-warning-foreground opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{stats.nearExpiryCount}</div>
              <p className="text-xs opacity-80">Expiring in 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive to-destructive/40 text-destructive-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Expired Medicines</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive-foreground opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{stats.expiredCount}</div>
              <p className="text-xs opacity-80">Already expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer hover:shadow-2xl transition-shadow border border-primary"
            onClick={() => setCurrentView("medicines")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Package className="h-6 w-6" />
                Medicine Management
              </CardTitle>
              <CardDescription className="text-secondary-foreground">
                Add, edit, and manage your medicine inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full " size="lg">
                Manage Medicines
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl transition-shadow border border-primary"
            onClick={() => setCurrentView("pos")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Activity className="h-6 w-6" />
                Point of Sale
              </CardTitle>
              <CardDescription className="text-secondary-foreground">
                Process sales and generate receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full"  size="lg">
                Open POS
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl transition-shadow border border-primary"
            onClick={() => setCurrentView("reports")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Users className="h-6 w-6" />
                Reports & Analytics
              </CardTitle>
              <CardDescription className="text-foreground">
                View sales reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full " size="lg">
                View Reports
              </Button>
            </CardContent>
          </Card>

          {user?.role === "owner" && (
            <Card
              className="cursor-pointer hover:shadow-2xl transition-shadow border border-primary"
              onClick={() => setCurrentView("users")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Users className="h-6 w-6" />
                  Manage Users
                </CardTitle>
                <CardDescription className="text-foreground">
                  Add, edit, and manage system users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Selling Medicines Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6 text-foreground">Top Selling Medicines</h3>
          {topSellingMedicines.length === 0 ? (
            <p className="text-foreground/80">No sales data available.</p>
          ) : (
            <div className="flex flex-col md:flex-row  h-32 md:gap-6 ">
              {topSellingMedicines.map((medicine, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-6 border border-primary rounded-lg shadow-sm hover:shadow-md transition-shadow bg-accent/10  flex-col mb-4 md:mb-0"
                >
                  <span className="font-semibold text-foreground">{medicine.name}</span>
                  <span className="text-sm text-foreground/70">
                    Sold: {medicine.sales} units | Revenue: <strong>Birr 
</strong>{medicine.revenue.toFixed(2)}
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
