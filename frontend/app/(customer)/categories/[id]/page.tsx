'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch, MenuCategory, MenuItem } from '../../../../lib/api';
import { useCart } from '../../../../components/CartContext';

export default function CategoryPage() {
  const params = useParams();
  const idParam = String(params?.id ?? 'all');
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [query, setQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { addItem, removeItem, items: cartItems } = useCart();

  // จัดการตัวเลขใน Input
  const getQty = (id: number) => Math.max(1, quantities[id] ?? 1);
  const setQty = (id: number, value: number) => {
    const next = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    setQuantities((prev) => ({ ...prev, [id]: next }));
  };

  // เช็คจำนวนที่มีอยู่แล้วในตะกร้า
  const getCartItemQty = (id: number) => {
    return cartItems.find((i) => i.menuItemId === id)?.qty || 0;
  };

  useEffect(() => {
    apiFetch<MenuItem[]>('/api/menu').then(setItems).catch(() => setItems([]));
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  const categoryId = idParam === 'all' ? null : Number(idParam);
  const category = categories.find((cat) => cat.id === categoryId) || null;
  const title = categoryId === null ? 'เมนูทั้งหมด' : category?.name || 'หมวดหมู่';

  /**
   * ระบบเพิ่มสินค้า (ไม่ต้อง Login)
   */
  const handleAdd = (item: MenuItem) => {
    const qty = getQty(item.id);
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      qty,
      imageUrl: item.imageUrl
    });
  };

  /**
   * ระบบลบสินค้า (ป้องกันค่าติดลบ)
   */
  const handleRemove = (item: MenuItem) => {
    const currentQty = getCartItemQty(item.id);
    const qtyToRemove = getQty(item.id);

    if (qtyToRemove >= currentQty) {
      removeItem(item.id);
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: Number(item.price),
        qty: -qtyToRemove,
        imageUrl: item.imageUrl
      });
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const itemCategoryId = item.category?.id ?? item.categoryId ?? 0;
      const matchesCategory = categoryId === null ? true : Number(itemCategoryId) === categoryId;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, categoryId]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">เลือกเมนูโปรดของคุณได้เลย</p>
        </div>
        <Link href="/" className="btn btn-outline w-fit px-6">
          กลับหน้าแรก
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาเมนูในหมวดนี้..."
          className="w-full rounded-full border border-slate-200 px-5 py-2.5 text-sm md:w-80 focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>

      {/* Menu Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          ไม่พบเมนูที่คุณต้องการในหมวดหมู่ {title}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const inCart = getCartItemQty(item.id);
            return (
              <div key={item.id} className="card overflow-hidden border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                <img
                  src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                  alt={item.name}
                  className="h-56 w-full object-cover md:h-64"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-blue-600">{item.category?.name}</div>
                    {inCart > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        ในตะกร้า: {inCart}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2 h-10">{item.description}</p>
                  
                  <div className="mt-4 flex flex-col gap-3 pt-4 border-t">
                    <span className="text-xl font-black text-slate-900">
                      ฿{Number(item.price).toLocaleString()}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={getQty(item.id)}
                        onChange={(e) => setQty(item.id, Number(e.target.value))}
                        className="w-16 rounded-lg border border-slate-300 py-1.5 text-center font-bold outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <div className="flex flex-1 gap-2">
                        {inCart > 0 && (
                          <button
                            onClick={() => handleRemove(item)}
                            className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95"
                          >
                            ลบ {getQty(item.id)}
                          </button>
                        )}
                        <button
                          onClick={() => handleAdd(item)}
                          className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                    <Link 
                      href={`/menu/${item.id}`} 
                      className="text-center text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      ดูรายละเอียดเพิ่มเติม
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}