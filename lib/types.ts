export type UserRole = "owner" | "pharmacist" | "cashier"

export interface User {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface RefillRecord {
  initialQuantity: number;
  refillDate: Date;
  endDate?: Date;
  batchNumber: string;
}

export interface Medicine {
  id: string
  name: string
  genericName?: string
  batchNumber: string
  manufacturer: string
  categoryId: string
  unitId: string
  price: number
  stockQuantity: number
  expiryDate: Date
  barcode?: string
  imageFile?: File
  createdAt: Date
  updatedAt: Date
  refillHistory?: RefillRecord[]
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
  description?: string
  createdAt: Date
}

export interface Sale {
  id: string
  date: Date
  totalAmount: number
  cashierId: string
  customerName?: string
  customerPhone?: string
  createdAt: Date
}

export interface SaleItem {
  id: string
  saleId: string
  medicineId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  medicine?: Medicine
}

export interface DashboardStats {
  todaySales: number
  weeklySales: number
  monthlySales: number
  totalMedicines: number
  lowStockCount: number
  expiredCount: number
  nearExpiryCount: number
}
