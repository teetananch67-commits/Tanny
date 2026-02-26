'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch, MenuItem, MenuCategory, Promotion } from '../../lib/api';
import { useCart } from '../../components/CartContext';
import { useAuth } from '../../components/AuthContext';

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
  const { addItem } = useCart();
  const { requireAuth } = useAuth();

  useEffect(() => {
    apiFetch<MenuItem[]>('/api/menu').then(setItems).catch(() => setItems([]));
    apiFetch<MenuItem[]>('/api/menu/recommended').then(setRecommended).catch(() => setRecommended([]));
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
    apiFetch<Promotion[]>('/api/promotions').then(setBanners).catch(() => setBanners([]));
  }, []);

  const sortedBanners = useMemo(() => {
    return [...banners].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [banners]);

  const activeBanner = sortedBanners[bannerIndex] || null;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
  }, [items, query]);

  return (
    <div className="space-y-10">
      <section className="card overflow-hidden p-0">
        {activeBanner ? (
          <div className="relative">
            <img
              src={activeBanner.imageUrl}
              alt="แบนเนอร์"
              className="h-[260px] w-full object-cover md:h-[360px]"
            />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-3 py-2">
              {sortedBanners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === bannerIndex ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                  onClick={() => setBannerIndex(index)}
                />
              ))}
            </div>
            {sortedBanners.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                <button
                  type="button"
                  className="rounded-full bg-white/80 px-3 py-2 text-sm"
                  onClick={() =>
                    setBannerIndex((prev) => (prev - 1 + sortedBanners.length) % sortedBanners.length)
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/80 px-3 py-2 text-sm"
                  onClick={() => setBannerIndex((prev) => (prev + 1) % sortedBanners.length)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">ยังไม่มีแบนเนอร์</div>
        )}
      </section>

      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">ประเภทเมนู</h2>
          <p className="text-sm text-slate-500">เลือกหมวดหมู่เพื่อดูเมนู</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/categories/all" className="card w-32 p-4 text-center transition">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              ⭐
            </div>
            <div className="text-sm font-semibold">ทั้งหมด</div>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="card w-32 p-4 text-center transition"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                {getCategoryIcon(cat.name)}
              </div>
              <div className="text-sm font-semibold">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">เมนูแนะนำ</h2>
          <p className="text-sm text-slate-500">เมนูยอดนิยมจากร้าน</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <img
                src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                alt={item.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="text-xs text-slate-500">{item.category?.name}</div>
                <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">THB {Number(item.price).toFixed(2)}</span>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      requireAuth() &&
                      addItem({
                        menuItemId: item.id,
                        name: item.name,
                        price: Number(item.price),
                        qty: 1,
                        imageUrl: item.imageUrl
                      })
                    }
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">เมนูทั้งหมด</h2>
            <p className="text-sm text-slate-500">ค้นหาหรือดูเมนูที่มีทั้งหมด</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเมนู"
            className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm md:w-64"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <img
                src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                alt={item.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="text-xs text-slate-500">{item.category?.name}</div>
                <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">THB {Number(item.price).toFixed(2)}</span>
                  <div className="flex gap-2">
                    <Link href={`/menu/${item.id}`} className="btn btn-outline">
                      รายละเอียด
                    </Link>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        requireAuth() &&
                        addItem({
                          menuItemId: item.id,
                          name: item.name,
                          price: Number(item.price),
                          qty: 1,
                          imageUrl: item.imageUrl
                        })
                      }
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
