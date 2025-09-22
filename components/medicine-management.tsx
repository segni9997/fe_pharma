"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth"
import { mockMedicines, mockCategories, mockUnits } from "@/lib/data"
import type { Medicine, RefillRecord } from "@/lib/types"
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
import { AlertTriangle, Calendar, Package, Plus, Search, Edit, Trash2, ArrowLeft, RefreshCw, History } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MedicineManagementProps {
  onBack: () => void
}

export function MedicineManagement({ onBack }: MedicineManagementProps) {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false);
  const [refillingMedicine, setRefillingMedicine] = useState<Medicine | null>(
    null
  );
  const [refillFormData, setRefillFormData] = useState({
    quantity: "",
    refillDate: new Date().toISOString().split("T")[0],
    endDate: "",
    batchNumber: "",
  });
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyMedicine, setHistoryMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    batchNumber: "",
    manufactureDate: "",
    unit: "",
    unitId: "",
    price: "",
    stockQuantity: "",
    expiryDate: "",
    barcode: "",
    imageFile: null as File | null,
  });

  const canEdit = user?.role === "owner";
  // || user?.role === "pharmacist"

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const matchesSearch =
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || medicine.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [medicines, searchTerm, selectedCategory]);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (expiryDate < today)
      return { label: "Expired", variant: "destructive" as const };
    if (expiryDate <= thirtyDaysFromNow)
      return { label: "Near Expiry", variant: "secondary" as const };
    return { label: "Valid", variant: "default" as const };
  };

  const resetForm = () => {
    setFormData({
      name: "",
      genericName: "",
      batchNumber: "",
      manufactureDate: "",
      unit: "",
      unitId: "",
      price: "",
      stockQuantity: "",
      expiryDate: "",
      barcode: "",
      imageFile: null,
    });
    setEditingMedicine(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const medicineData: Medicine = {
      id: editingMedicine?.id || Date.now().toString(),
      name: formData.name,
      genericName: formData.genericName || undefined,
      batchNumber: formData.batchNumber,
      manufacturer: formData.manufactureDate,
      categoryId: formData.unit,
      unitId: formData.unitId,
      price: Number.parseFloat(formData.price),
      stockQuantity: Number.parseInt(formData.stockQuantity),
      expiryDate: new Date(formData.expiryDate),
      barcode: formData.barcode || undefined,
      imageFile: formData.imageFile ?? undefined,
      createdAt: editingMedicine?.createdAt || new Date(),
      updatedAt: new Date(),
      refillHistory: editingMedicine?.refillHistory,
    };

    if (editingMedicine) {
      setMedicines((prev) =>
        prev.map((med) => (med.id === editingMedicine.id ? medicineData : med))
      );
    } else {
      setMedicines((prev) => [...prev, medicineData]);
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName || "",
      batchNumber: medicine.batchNumber,
      manufactureDate: medicine.manufacturer,
      unit: medicine.categoryId,
      unitId: medicine.unitId || "",
      price: medicine.price.toString(),
      stockQuantity: medicine.stockQuantity.toString(),
      expiryDate: medicine.expiryDate.toISOString().split("T")[0],
      barcode: medicine.barcode || "",
      imageFile: medicine.imageFile || null,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (medicineId: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      setMedicines((prev) => prev.filter((med) => med.id !== medicineId));
    }
  };

  const handleRefill = (medicine: Medicine) => {
    setRefillingMedicine(medicine);
    setRefillFormData({
      quantity: "",
      refillDate: new Date().toISOString().split("T")[0],
      endDate: "",
      batchNumber: "",
    });
    setIsRefillDialogOpen(true);
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillingMedicine) return;

    const quantity = Number.parseInt(refillFormData.quantity);
    const refillRecord: RefillRecord = {
      initialQuantity: quantity,
      refillDate: new Date(refillFormData.refillDate),
      endDate: refillFormData.endDate
        ? new Date(refillFormData.endDate)
        : undefined,
      batchNumber: refillFormData.batchNumber,
    };

    setMedicines((prev) =>
      prev.map((med) =>
        med.id === refillingMedicine.id
          ? {
              ...med,
              stockQuantity: med.stockQuantity + quantity,
              refillHistory: [...(med.refillHistory || []), refillRecord],
              updatedAt: new Date(),
            }
          : med
      )
    );

    setIsRefillDialogOpen(false);
    setRefillingMedicine(null);
  };

  const handleHistory = (medicine: Medicine) => {
    setHistoryMedicine(medicine);
    setIsHistoryDialogOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    return (
      mockCategories.find((cat) => cat.id === categoryId)?.name || "Unknown"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-card to-background dark:from-background dark:via-card dark:to-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-md dark:from-primary dark:to-secondary">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="md:text-3xl text-lg font-extrabold text-white tracking-wide">
              Medicine Management
            </h1>
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
                  <DialogTitle>
                    {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMedicine
                      ? "Update medicine information"
                      : "Enter the details for the new medicine"}
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genericName">
                          Generic Name (Optional)
                        </Label>
                        <Input
                          id="genericName"
                          value={formData.genericName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              genericName: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number *</Label>
                        <Input
                          id="batchNumber"
                          value={formData.batchNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              batchNumber: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manufactureDate">
                          Manufacture Date *
                        </Label>
                        <Input
                          id="manufactureDate"
                          type="date"
                          value={formData.manufactureDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              manufactureDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit *</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              unit: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stockQuantity: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              expiryDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (Optional)</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            barcode: e.target.value,
                          }))
                        }
                        placeholder="Enter barcode number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageFile">Image File (Optional)</Label>
                      <input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            imageFile: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingMedicine ? "Update Medicine" : "Add Medicine"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Refill Dialog */}
          <Dialog
            open={isRefillDialogOpen}
            onOpenChange={setIsRefillDialogOpen}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Refill Medicine</DialogTitle>
                <DialogDescription>
                  Add stock to {refillingMedicine?.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRefillSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="refillQuantity">Quantity to Add *</Label>
                    <Input
                      id="refillQuantity"
                      type="number"
                      value={refillFormData.quantity}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refillDate">Refill Date *</Label>
                    <Input
                      id="refillDate"
                      type="date"
                      value={refillFormData.refillDate}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          refillDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={refillFormData.endDate}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number *</Label>
                    <Input
                      id="batchNumber"
                      value={refillFormData.batchNumber}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          batchNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter batch number"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRefillDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Refill</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* History Dialog */}
          <Dialog
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Refill History - {historyMedicine?.name}
                </DialogTitle>
                <DialogDescription>
                  View all refill records for this medicine
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {historyMedicine?.refillHistory &&
                historyMedicine.refillHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Initial Quantity</TableHead>
                        <TableHead>Refill Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyMedicine.refillHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.initialQuantity}</TableCell>
                          <TableCell>
                            {record.refillDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {record.endDate
                              ? record.endDate.toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No refill history available.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsHistoryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-border focus:border-ring"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-56 h-12 border-border focus:border-ring">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerts */}
        <div className="space-y-6 mb-8">
          {medicines.filter((med) => med.stockQuantity < 10).length > 0 && (
            <Alert className="border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive dark:text-destructive">
                {medicines.filter((med) => med.stockQuantity < 10).length}{" "}
                medicines have low stock (below 10 units). Total refills:{" "}
                {medicines
                  .filter((med) => med.stockQuantity < 10)
                  .reduce(
                    (sum, med) => sum + (med.refillHistory?.length || 0),
                    0
                  )}
              </AlertDescription>
            </Alert>
          )}
          {medicines.filter((med) => {
            const today = new Date();
            const thirtyDaysFromNow = new Date(
              today.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            return med.expiryDate <= thirtyDaysFromNow;
          }).length > 0 && (
            <Alert className="border-warning/20 bg-warning/5 dark:border-warning/40 dark:bg-warning/10">
              <Calendar className="h-5 w-5 text-warning" />
              <AlertDescription className="text-warning dark:text-warning">
                {
                  medicines.filter((med) => {
                    const today = new Date();
                    const thirtyDaysFromNow = new Date(
                      today.getTime() + 30 * 24 * 60 * 60 * 1000
                    );
                    return med.expiryDate <= thirtyDaysFromNow;
                  }).length
                }{" "}
                medicines are expiring within 30 days
              </AlertDescription>
            </Alert>
          )}
          {medicines.filter(
            (med) =>
              med.stockQuantity < 5 &&
              med.refillHistory &&
              med.refillHistory.length > 0
          ).length > 0 && (
            <Alert className="border-border bg-muted/50 dark:border-border dark:bg-muted/50">
              <Package className="h-5 w-5 text-primary" />
              <AlertDescription className="text-foreground">
                Refill alert:{" "}
                {
                  medicines.filter(
                    (med) =>
                      med.stockQuantity < 5 &&
                      med.refillHistory &&
                      med.refillHistory.length > 0
                  ).length
                }{" "}
                medicines have very low stock and refill history. Consider
                refilling based on past patterns.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Medicine Table */}
        <Card className="shadow-xl border-border">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/50 dark:to-muted/30">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Package className="h-6 w-6" />
              Medicine Inventory ({filteredMedicines.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your medicine inventory and track stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Medicine</TableHead>
                    <TableHead className="text-foreground">Image</TableHead>
                    <TableHead className="text-foreground">Unit</TableHead>
                    <TableHead className="text-foreground">Batch</TableHead>
                    <TableHead className="text-foreground">Price</TableHead>
                    <TableHead className="text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground">Expiry</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    {canEdit && (
                      <TableHead className="text-foreground">Refills</TableHead>
                    )}
                    {canEdit && (
                      <TableHead className="text-foreground">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stockQuantity);
                    const expiryStatus = getExpiryStatus(medicine.expiryDate);

                    return (
                      <TableRow key={medicine.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-foreground">
                              {medicine.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {medicine.manufacturer}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {medicine.imageFile ? (
                            <img
                              src={URL.createObjectURL(medicine.imageFile)}
                              alt={medicine.name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getCategoryName(medicine.categoryId)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {medicine.batchNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          ${medicine.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={stockStatus.variant}
                            className="font-medium"
                          >
                            {medicine.stockQuantity} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {medicine.expiryDate.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={expiryStatus.variant}
                            className="font-medium"
                          >
                            {expiryStatus.label}
                          </Badge>
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-foreground">
                            {medicine.refillHistory?.length || 0}
                          </TableCell>
                        )}
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefill(medicine)}
                                className="hover:bg-accent"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHistory(medicine)}
                                className="hover:bg-accent"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(medicine)}
                                className="hover:bg-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(medicine.id)}
                                className="hover:bg-destructive/50 dark:hover:bg-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
