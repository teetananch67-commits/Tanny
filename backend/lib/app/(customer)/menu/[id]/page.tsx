'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, MenuItem } from '../../../../lib/api';
import { useCart } from '../../../../components/CartContext';
import { useAuth } from '../../../../components/AuthContext';

export default function MenuDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [item, setItem] = useState<MenuItem | null>(null);
  const { addItem } = useCart();
  const { requireAuth } = useAuth();

  useEffect(() => {
    apiFetch<MenuItem[]>('/api/menu').then((data) => {
      const found = data.find((m) => m.id === id);
      setItem(found || null);
    });
  }, [id]);

  if (!item) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-500">ไม่พบรายการเมนู</p>
        <Link href="/" className="btn btn-outline mt-4">
          กลับหน้าเมนู
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="card p-6">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="mb-4 h-56 w-full rounded-2xl object-cover"
          />
        )}
        <div className="text-xs text-slate-500">{item.category?.name}</div>
        <h1 className="mt-2 text-3xl font-semibold">{item.name}</h1>
        <p className="mt-2 text-slate-600">{item.description}</p>
        <p className="mt-4 text-2xl font-semibold">THB {Number(item.price).toFixed(2)}</p>
      </div>
      <div className="card p-6 space-y-4">
        <p className="text-sm text-slate-500">ทางลัด</p>
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
          เพิ่มลงตะกร้า
        </button>
        <Link href="/cart" className="btn btn-outline">
          ไปที่ตะกร้า
        </Link>
      </div>
    </div>
  );
}
