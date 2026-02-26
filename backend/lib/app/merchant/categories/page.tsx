'use client';

import { useEffect, useState } from 'react';
import { apiFetch, MenuCategory } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

export default function MerchantCategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const { notifySuccess, notifyError } = useAlert();

  const load = () => {
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await apiFetch('/api/merchant/categories', {
        method: 'POST',
        body: JSON.stringify({ name: payload.name })
      });
      event.currentTarget.reset();
      notifySuccess('เพิ่มหมวดหมู่สำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const handleUpdate = async (id: number, name: string) => {
    try {
      await apiFetch(`/api/merchant/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      notifySuccess('แก้ไขหมวดหมู่สำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const remove = async (id: number) => {
    try {
      await apiFetch(`/api/merchant/categories/${id}`, { method: 'DELETE' });
      notifySuccess('ลบหมวดหมู่สำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">หมวดหมู่</h1>
        <p className="text-sm text-slate-500">จัดระเบียบเมนูอาหาร</p>
      </div>
      <form className="card flex flex-col gap-3 p-6 md:flex-row" onSubmit={handleCreate}>
        <input
          name="name"
          placeholder="ชื่อหมวดหมู่"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          required
        />
        <button className="btn btn-primary" type="submit">
          เพิ่มหมวดหมู่
        </button>
      </form>

      <div className="card divide-y">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <input
              defaultValue={cat.name}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              onBlur={(event) => handleUpdate(cat.id, event.target.value)}
            />
            <button className="btn btn-outline" onClick={() => remove(cat.id)}>
              ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
