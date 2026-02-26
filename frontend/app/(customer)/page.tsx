'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch, MenuItem, MenuCategory, Promotion } from '../../lib/api';
import { useCart } from '../../components/CartContext';

const getCategoryIcon = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes('ข้าว') || key.includes('rice')) return '🍚';
  if (key.includes('ก๋วยเตี๋ยว') || key.includes('noodle')) return '🍜';
  if (key.includes('เครื่องดื่ม') || key.includes('drink')) return '🥤';
  if (key.includes('ทอด') || key.includes('fried')) return '🍗';
  if (key.includes('ผัด') || key.includes('stir')) return '🥘';
  if (key.includes('ยำ') || key.includes('yum')) return '🥗';
  if (key.includes('ต้ม') || key.includes('soup')) return '🍲';
  if (key.includes('ของหวาน') || key.includes('dessert')) return '🍰';
  if (key.includes('ย่าง') || key.includes('grill')) return '🔥';
  return '🍽️';
};

export default function HomePage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [recommended, setRecommended] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [banners, setBanners] = useState<Promotion[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  
  const { addItem, removeItem, items: cartItems } = useCart();

  const getQty = (id: number) => Math.max(1, quantities[id] ?? 1);
  const setQty = (id: number, value: number) => {
    const next = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    setQuantities((prev) => ({ ...prev, [id]: next }));
  };

  const getCartItemQty = (id: number) => {
    return cartItems.find(i => i.menuItemId === id)?.qty || 0;
  };

  // ดึงข้อมูล API
  useEffect(() => {
    apiFetch<MenuItem[]>('/api/menu').then(setItems).catch(() => setItems([]));
    apiFetch<MenuItem[]>('/api/menu/recommended').then(setRecommended).catch(() => setRecommended([]));
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
    apiFetch<Promotion[]>('/api/promotions').then(setBanners).catch(() => setBanners([]));
  }, []);

  const sortedBanners = useMemo(() => {
    return [...banners].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [banners]);

  /**
   * ระบบ Auto-slide สำหรับ Banner
   * จะเลื่อนทุกๆ 5 วินาที
   */
  useEffect(() => {
    if (sortedBanners.length <= 1) return;

    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % sortedBanners.length);
    }, 3000); // 1000ms = 1 วินาที

    return () => clearInterval(interval);
  }, [sortedBanners]);

  const activeBanner = sortedBanners[bannerIndex] || null;

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
    return items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  return (
    <div className="space-y-10">
      {/* 1. Banner Section (Auto-slide & Large Image) */}
      <section className="card overflow-hidden p-0">
        {activeBanner ? (
          <div className="relative">
            <img
              src={activeBanner.imageUrl}
              alt="แบนเนอร์"
              className="h-[260px] w-full object-cover transition-opacity duration-1000 md:h-[360px]"
            />
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-3 py-2">
              {sortedBanners.map((_, index) => (
                <button
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === bannerIndex ? 'w-5 bg-slate-900' : 'bg-slate-300'
                  }`}
                  onClick={() => setBannerIndex(index)}
                />
              ))}
            </div>
            {/* Navigation Arrows */}
            {sortedBanners.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setBannerIndex((prev) => (prev - 1 + sortedBanners.length) % sortedBanners.length)}
                  className="h-10 w-10 rounded-full bg-white/70 text-xl font-bold hover:bg-white"
                >‹</button>
                <button
                  onClick={() => setBannerIndex((prev) => (prev + 1) % sortedBanners.length)}
                  className="h-10 w-10 rounded-full bg-white/70 text-xl font-bold hover:bg-white"
                >›</button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500 bg-slate-100">กำลังโหลดแบนเนอร์...</div>
        )}
      </section>

      {/* 2. Categories Section */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">ประเภทเมนู</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/categories/all" className="card w-32 p-4 text-center transition hover:scale-105">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white text-lg">⭐</div>
            <div className="text-sm font-semibold">ทั้งหมด</div>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}`} className="card w-32 p-4 text-center transition hover:scale-105">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white text-lg">
                {getCategoryIcon(cat.name)}
              </div>
              <div className="text-sm font-semibold">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Recommended Section (Large Images) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">เมนูแนะนำ</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {recommended.map((item) => {
            const inCart = getCartItemQty(item.id);
            return (
              <div key={item.id} className="card overflow-hidden border border-slate-100 shadow-sm">
                <img
                  src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                  alt={item.name}
                  className="h-56 w-full object-cover transition-transform hover:scale-105"
                />
                <div className="p-4">
                  <div className="text-xs text-slate-500 font-medium">{item.category?.name}</div>
                  <h3 className="mt-1 text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 h-10">{item.description}</p>
                  <div className="mt-4 flex flex-col gap-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                       <span className="font-bold text-xl text-slate-900">฿{Number(item.price).toFixed(2)}</span>
                       {inCart > 0 && <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">ในตะกร้า: {inCart}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={getQty(item.id)}
                        onChange={(e) => setQty(item.id, Number(e.target.value))}
                        className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center font-bold"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. All Menu Section */}
      <section className="space-y-4 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">เมนูทั้งหมด</h2>
          <div className="relative">
             <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาเมนูอาหาร..."
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm md:w-64 focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const inCart = getCartItemQty(item.id);
            return (
              <div key={item.id} className="card overflow-hidden border border-slate-100 shadow-sm">
                <img
                  src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                  alt={item.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-3">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className="font-bold text-slate-900">฿{Number(item.price).toFixed(2)}</span>
                       {inCart > 0 && <span className="text-[10px] font-bold text-blue-600">มีแล้ว {inCart}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={getQty(item.id)}
                        onChange={(e) => setQty(item.id, Number(e.target.value))}
                        className="w-12 rounded border border-slate-300 py-1 text-center text-xs font-bold"
                      />
                      <div className="flex flex-1 gap-1">
                        {inCart > 0 && (
                          <button
                            onClick={() => handleRemove(item)}
                            className="flex-1 rounded bg-red-500 py-1 text-[10px] font-bold text-white"
                          >
                            ลบ
                          </button>
                        )}
                        <button
                          onClick={() => handleAdd(item)}
                          className="flex-1 rounded bg-slate-900 py-1 text-[10px] font-bold text-white"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">ไม่พบเมนูที่คุณค้นหา...</div>
        )}
      </section>
    </div>
  );
}