
export enum Category {
  ALL = 'All',
  SPICY = 'Spicy',
  DESSERT = 'Dessert',
  PIZZA = 'Pizza',
  DRINK = 'Drink',
  BURGER = 'Burger',
  NOODLES = 'Noodles',
  MOMO = 'Momo',
  RICE = 'Rice'
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category | string; // Updated to allow string for dynamic categories
  rating: number;
  image: string;
  description: string;
  time?: string;
  calories?: string;
  pointCost?: number; // Cost in points if redeemed as a reward
  isAvailable?: boolean; // For "86" functionality (Out of stock)
  requiresPreparation?: boolean; // True for Kitchen (Momos), False for Bar/Counter (Drinks, Smoke)
  servingUnit?: string; // For Bar/Counter items (e.g., 'Glass', 'Shot')
  // New Discount Field
  discount?: {
    name: string;
    oldPrice: number;
    newPrice: number;
  };
  oldPrice?: number; // Legacy support or direct field
}

export interface ItemCustomization {
  portion: 'Half' | 'Full' | 'Family';
  spiceLevel: number; // 0-100
  isVeg: boolean;
  excludedIngredients: string[];
}

export type OrderStatus = 'pending' | 'queue' | 'accepted' | 'cooking' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface CartItem extends MenuItem {
  quantity: number;
  customization?: ItemCustomization; // Optional for quick added items
  // Per-item status tracking
  status?: OrderStatus; 
  targetTime?: number; // Timestamp (ms) when the current phase is expected to end
  startTime?: number; // Timestamp (ms) when the current phase started (for progress bars)
  isBarArchived?: boolean; // NEW: Track if bar item is cleared from active screen
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  items: CartItem[]; 
  earnedPoints: number;
  pointsUsed: number; // POINTS USED in this order (Rewards + Discount)
  discountAmount: number; // Cash value of points used
  userMobile?: string; 
  sessionId?: string; // NEW: To track guest orders for the current table session
  status: OrderStatus; // Overall order status (derived from items)
  // New Payment Fields
  paymentStatus?: 'unpaid' | 'pending_verification' | 'paid';
  paymentMethod?: string;
  paymentProofUrl?: string;
  tableNumber?: string; // Explicit table number for KDS
  startTime?: number; // For tracking overall order start time
  isKitchenArchived?: boolean; // NEW: To manually archive cancelled tickets in Kitchen
  
  // Tax Snapshot Fields
  taxRate?: number;   // The tax rate % applied at the time of order (e.g., 13)
  taxAmount?: number; // The calculated tax amount at the time of order
}

export interface User {
  name: string;
  mobile: string;
  points: number;
  isRegistered: boolean;
  // New Fields for CRM
  joinedDate?: string;
  usedPoints?: number;
  isActive?: boolean;
}

export type AppView = 'home' | 'orders' | 'support' | 'history' | 'about';

export enum PaymentMethod {
  ESEWA = 'esewa',
  KHALTI = 'khalti',
  CASH = 'cash',
  CONNECT_IPS = 'connect_ips'
}

// --- ADMIN SPECIFIC TYPES ---

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';

// Represents a distinct group of customers sitting at a table
export interface TableGroup {
  id: string; // Unique Session ID for this group
  name?: string; // "Family 1" or "Sushil (Host)"
  hostName?: string; // Specific host name if logged in
  guests: number;
  startTime: string;
  activeOrders: OrderHistoryItem[];
  totalAmount: number;
  status: 'active' | 'paid' | 'cleared';
  colorCode?: string; // For UI differentiation (bg-blue-50, etc)
}

export interface TableSession {
  id: string;
  tableNumber: string;
  status: TableStatus;
  capacity: number;
  
  // NEW: Support multiple groups per table
  groups: TableGroup[]; 
  
  // Legacy fields (computed or deprecated)
  guests?: number; // Sum of all groups
  startTime?: string; // Earliest start time
  totalAmount?: number; // Sum of all groups
  activeOrders?: OrderHistoryItem[]; // Flattened list of all orders
  
  location?: string;
  isSpecial?: boolean;
  qrCode?: string;
}
