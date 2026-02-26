export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }

  return res.json();
}

export type MenuCategory = {
  id: number;
  name: string;
};

export type MenuItem = {
  id: number;
  categoryId?: number | null;
  name: string;
  description?: string | null;
  price: string | number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isRecommended: boolean;
  category: MenuCategory;
};

export type OrderItem = {
  id: number;
  menuItemId: number;
  nameSnapshot: string;
  priceSnapshot: string | number;
  qty: number;
  total: string | number;
};

export type OrderStatusLog = {
  id: number;
  status: string;
  createdAt: string;
  byRole: string;
};

export type Order = {
  id: number;
  orderNo: string;
  status: string;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  createdAt: string;
  customerNameSnapshot?: string | null;
  customerPhoneSnapshot?: string | null;
  addressSnapshot?: {
    label?: string | null;
    recipientName?: string | null;
    phone?: string | null;
    line1?: string | null;
    note?: string | null;
  } | null;
  items: OrderItem[];
  statusLogs?: OrderStatusLog[];
};

export type Promotion = {
  id: number;
  title?: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export type Address = {
  id: number;
  label: string;
  recipientName: string;
  phone?: string | null;
  line1: string;
  note?: string | null;
  isDefault: boolean;
};

export type RestaurantSettings = {
  id: number;
  deliveryFee: string | number;
  openHours: string;
  qrImageUrl?: string | null;
  acceptCash: boolean;
};
