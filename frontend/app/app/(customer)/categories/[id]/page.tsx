'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch, MenuCategory, MenuItem } from '../../../../lib/api';
import { useCart } from '../../../../components/CartContext';
import { useAuth } from '../../../../components/AuthContext';

export default function CategoryPage() {
  const params = useParams();
  const idParam = String(params?.id ?? 'all');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [query, setQuery] = useState('');
  const { addItem } = useCart();
  const { requireAuth } = useAuth();

  useEffect(() => {
    apiFetch<MenuItem[]>('/api/menu').then(setItems).catch(() => setItems([]));
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  const categoryId = idParam === 'all' ? null : Number(idParam);
  const category = categories.find((cat) => cat.id === categoryId) || null;
  const title = categoryId === null ? 'เมนูทั้งหมด' : category?.name || 'หมวดหมู่';

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-500">เลือกเมนูและกดเพิ่มลงตะกร้าได้เลย</p>
        </div>
        <Link href="/" className="btn btn-outline w-fit">
          กลับหน้าแรก
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาเมนู"
          className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm md:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6 text-sm text-slate-500">ยังไม่มีเมนูในหมวดนี้</div>
      ) : (
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
      )}
    </div>
  );
}
