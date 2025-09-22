"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { mockMedicines, mockCategories } from "@/lib/data";
import type { Medicine, Sale, SaleItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface POSSystemProps {
  onBack: () => void;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function POSSystem({ onBack }: POSSystemProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [lastSaleItems, setLastSaleItems] = useState<SaleItem[]>([]);

  const filteredMedicines = useMemo(() => {
    return mockMedicines.filter((medicine) => {
      const matchesSearch =
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || medicine.categoryId === selectedCategory;
      const inStock = medicine.stockQuantity > 0;
      return matchesSearch && matchesCategory && inStock;
    });
  }, [searchTerm, selectedCategory]);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find((item) => item.medicine.id === medicine.id);

    if (existingItem) {
      if (existingItem.quantity < medicine.stockQuantity) {
        setCart((prev) =>
          prev.map((item) =>
            item.medicine.id === medicine.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalPrice: (item.quantity + 1) * item.unitPrice,
                }
              : item
          )
        );
      }
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicine,
          quantity: 1,
          unitPrice: medicine.price,
          totalPrice: medicine.price,
        },
      ]);
    }
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = mockMedicines.find((med) => med.id === medicineId);
    if (!medicine || newQuantity > medicine.stockQuantity) return;

    setCart((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
  };

  const processSale = () => {
    if (cart.length === 0) return;

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date(),
      totalAmount: total,
      cashierId: user?.id || "",
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      createdAt: new Date(),
    };

    const saleItems: SaleItem[] = cart.map((item) => ({
      id: `Birr {sale.id}-Birr {item.medicine.id}`,
      saleId: sale.id,
      medicineId: item.medicine.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      medicine: item.medicine,
    }));

    setLastSale(sale);
    setLastSaleItems(saleItems);
    setShowReceipt(true);
    clearCart();
  };

  const getCategoryName = (categoryId: string) => {
    return (
      mockCategories.find((cat) => cat.id === categoryId)?.name || "Unknown"
    );
  };

  const printReceipt = () => {
    window.print();
  };

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
            <h1 className="md:text-3xl text-lg font-bold text-primary">Point of Sale</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              Cashier: {user?.name}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medicine Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Select Medicines
                </CardTitle>
                <CardDescription>
                  Search and add medicines to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full sm:w-48">
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

                {/* Medicine Table */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredMedicines.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No medicines found
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Add To Cart</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMedicines.map((medicine) => (
                          <TableRow
                            key={medicine.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => addToCart(medicine)}
                          >
                            <TableCell>{medicine.name}</TableCell>
                            <TableCell>{medicine.manufacturer}</TableCell>
                            <TableCell>
                              {getCategoryName(medicine.categoryId)}
                            </TableCell>
                            <TableCell>Birr {medicine.price.toFixed(2)}</TableCell>
                            <TableCell>{medicine.stockQuantity}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Cart is empty
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.medicine.id}>
                          <TableCell>{item.medicine.name}</TableCell>
                          <TableCell>Birr {item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.medicine.id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.medicine.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>Birr {item.totalPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.medicine.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkout */}
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Birr {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount ({discount}%):</span>
                      <span>-Birr {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Birr {total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={processSale}
                    disabled={cart.length === 0}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Process Sale
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
            <DialogDescription>
              Receipt generated successfully
            </DialogDescription>
          </DialogHeader>

          {lastSale && (
            <div className="space-y-4 print:text-black">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">PharmaCare</h2>
                <p className="text-sm text-muted-foreground">
                  Pharmacy Management System
                </p>
                <p className="text-xs">Receipt #{lastSale.id}</p>
                <p className="text-xs">{lastSale.date.toLocaleString()}</p>
              </div>

              {lastSale.customerName && (
                <div className="text-sm">
                  <p>
                    <strong>Customer:</strong> {lastSale.customerName}
                  </p>
                  {lastSale.customerPhone && (
                    <p>
                      <strong>Phone:</strong> {lastSale.customerPhone}
                    </p>
                  )}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty x Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastSaleItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.medicine?.name}</TableCell>
                      <TableCell>
                        {item.quantity} × Birr {item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        Birr {item.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Birr {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount:</span>
                    <span>-Birr {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>Birr {lastSale.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground border-t pt-2">
                <p>Thank you for your business!</p>
                <p>Served by: {user?.name}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={printReceipt}>
              Print Receipt
            </Button>
            <Button onClick={() => setShowReceipt(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
