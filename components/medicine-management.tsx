"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth"
import { mockMedicines, mockCategories } from "@/lib/data"
import type { Medicine } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Calendar, Package, Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MedicineManagementProps {
  onBack: () => void
}

export function MedicineManagement({ onBack }: MedicineManagementProps) {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    batchNumber: "",
    manufacturer: "",
    categoryId: "",
    price: "",
    stockQuantity: "",
    expiryDate: "",
    barcode: "",
  })

  const canEdit = user?.role === "owner" || user?.role === "pharmacist"

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const matchesSearch =
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || medicine.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [medicines, searchTerm, selectedCategory])

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (quantity < 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (expiryDate < today) return { label: "Expired", variant: "destructive" as const }
    if (expiryDate <= thirtyDaysFromNow) return { label: "Near Expiry", variant: "secondary" as const }
    return { label: "Valid", variant: "default" as const }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      batchNumber: "",
      manufacturer: "",
      categoryId: "",
      price: "",
      stockQuantity: "",
      expiryDate: "",
      barcode: "",
    })
    setEditingMedicine(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const medicineData: Medicine = {
      id: editingMedicine?.id || Date.now().toString(),
      name: formData.name,
      batchNumber: formData.batchNumber,
      manufacturer: formData.manufacturer,
      categoryId: formData.categoryId,
      price: Number.parseFloat(formData.price),
      stockQuantity: Number.parseInt(formData.stockQuantity),
      expiryDate: new Date(formData.expiryDate),
      barcode: formData.barcode || undefined,
      createdAt: editingMedicine?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (editingMedicine) {
      setMedicines((prev) => prev.map((med) => (med.id === editingMedicine.id ? medicineData : med)))
    } else {
      setMedicines((prev) => [...prev, medicineData])
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      batchNumber: medicine.batchNumber,
      manufacturer: medicine.manufacturer,
      categoryId: medicine.categoryId,
      price: medicine.price.toString(),
      stockQuantity: medicine.stockQuantity.toString(),
      expiryDate: medicine.expiryDate.toISOString().split("T")[0],
      barcode: medicine.barcode || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (medicineId: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      setMedicines((prev) => prev.filter((med) => med.id !== medicineId))
    }
  }

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find((cat) => cat.id === categoryId)?.name || "Unknown"
  }

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
            <h1 className="text-2xl font-bold text-primary">Medicine Management</h1>
          </div>
          {canEdit && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
                  <DialogDescription>
                    {editingMedicine ? "Update medicine information" : "Enter the details for the new medicine"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Medicine Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number *</Label>
                        <Input
                          id="batchNumber"
                          value={formData.batchNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, batchNumber: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer *</Label>
                        <Input
                          id="manufacturer"
                          value={formData.manufacturer}
                          onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (Optional)</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                        placeholder="Enter barcode number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingMedicine ? "Update Medicine" : "Add Medicine"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerts */}
        <div className="space-y-4 mb-6">
          {medicines.filter((med) => med.stockQuantity < 10).length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {medicines.filter((med) => med.stockQuantity < 10).length} medicines have low stock (below 10 units)
              </AlertDescription>
            </Alert>
          )}
          {medicines.filter((med) => {
            const today = new Date()
            const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            return med.expiryDate <= thirtyDaysFromNow
          }).length > 0 && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                {
                  medicines.filter((med) => {
                    const today = new Date()
                    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                    return med.expiryDate <= thirtyDaysFromNow
                  }).length
                }{" "}
                medicines are expiring within 30 days
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Medicine Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Medicine Inventory ({filteredMedicines.length})
            </CardTitle>
            <CardDescription>Manage your medicine inventory and track stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    {canEdit && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stockQuantity)
                    const expiryStatus = getExpiryStatus(medicine.expiryDate)

                    return (
                      <TableRow key={medicine.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-muted-foreground">{medicine.manufacturer}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(medicine.categoryId)}</TableCell>
                        <TableCell className="font-mono text-sm">{medicine.batchNumber}</TableCell>
                        <TableCell>${medicine.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{medicine.stockQuantity} units</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{medicine.expiryDate.toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(medicine)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(medicine.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
