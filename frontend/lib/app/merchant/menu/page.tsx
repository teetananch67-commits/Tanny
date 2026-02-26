'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, MenuCategory, MenuItem } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

const emptyForm = {
  name: '',
  categoryId: '',
  price: '',
  imageUrl: '',
  description: '',
  isAvailable: true,
  isRecommended: false
};

type FormState = typeof emptyForm;

export default function MerchantMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageData, setImageData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { notifySuccess, notifyError } = useAlert();

  const load = () => {
    apiFetch<MenuItem[]>('/api/menu').then(setItems).catch(() => setItems([]));
    apiFetch<MenuCategory[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageData(null);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      categoryId: String(item.category?.id || item.categoryId || ''),
      price: String(item.price ?? ''),
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      isAvailable: item.isAvailable,
      isRecommended: item.isRecommended
    });
    setImageData(null);
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.categoryId || !form.price) return;
    const imageUrl = imageData || form.imageUrl;
    if (!editingId && !imageUrl) return;

    setSaving(true);
    try {
      const payload = {
        categoryId: Number(form.categoryId),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl,
        isAvailable: form.isAvailable,
        isRecommended: form.isRecommended
      };

      if (editingId) {
        await apiFetch(`/api/merchant/menu/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        notifySuccess('แก้ไขเมนูสำเร็จ');
      } else {
        await apiFetch('/api/merchant/menu', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        notifySuccess('เพิ่มเมนูสำเร็จ');
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setImageData(null);
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await apiFetch(`/api/merchant/menu/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      notifySuccess('อัปเดตสถานะสำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const remove = async (id: number) => {
    try {
      await apiFetch(`/api/merchant/menu/${id}`, { method: 'DELETE' });
      notifySuccess('ลบเมนูสำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const modalTitle = useMemo(() => (editingId ? 'แก้ไขเมนู' : 'เพิ่มเมนู'), [editingId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">เมนู</h1>
          <p className="text-sm text-slate-500">จัดการรายการอาหาร</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          เพิ่มเมนู
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3">รูป</th>
              <th className="px-4 py-3">ชื่อเมนู</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3">ราคา</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  <img
                    src={item.imageUrl || 'https://picsum.photos/seed/placeholder/200/120'}
                    alt={item.name}
                    className="h-12 w-20 rounded-lg object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </td>
                <td className="px-4 py-3">{item.category?.name}</td>
                <td className="px-4 py-3">THB {Number(item.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="badge">{item.isAvailable ? 'เปิดขาย' : 'ซ่อน'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline" onClick={() => openEdit(item)}>
                      แก้ไข
                    </button>
                    <button className="btn btn-outline" onClick={() => toggleAvailability(item)}>
                      {item.isAvailable ? 'ปิดขาย' : 'เปิดขาย'}
                    </button>
                    <button className="btn btn-outline" onClick={() => remove(item.id)}>
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{modalTitle}</h2>
                <button className="badge" onClick={() => setModalOpen(false)}>
                  ปิด
                </button>
              </div>
              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
                <input
                  name="name"
                  placeholder="ชื่อเมนู"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
                <select
                  name="categoryId"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="ราคา"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                />
                <input
                  name="imageUrl"
                  placeholder="ลิงก์รูปภาพ"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  required={!editingId && !imageData}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setImageData(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
                <input
                  name="description"
                  placeholder="คำอธิบาย"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="isAvailable"
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
                  />
                  เปิดขาย
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="isRecommended"
                    type="checkbox"
                    checked={form.isRecommended}
                    onChange={(event) => setForm({ ...form, isRecommended: event.target.checked })}
                  />
                  เมนูแนะนำ
                </label>
                <button className="btn btn-primary md:col-span-2" type="submit" disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกเมนู'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
