'use client';

import { useEffect, useState } from 'react';
import { apiFetch, Promotion } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

export default function MerchantPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useAlert();

  const load = () => {
    apiFetch<Promotion[]>('/api/merchant/promotions').then(setPromotions).catch(() => setPromotions([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form.entries());
    const imageUrl = imageData || payload.imageUrl;
    try {
      await apiFetch('/api/merchant/promotions', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          imageUrl,
          sortOrder: Number(payload.sortOrder || 0),
          isActive: payload.isActive === 'on'
        })
      });
      formEl.reset();
      setImageData(null);
      notifySuccess('เพิ่มแบนเนอร์สำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await apiFetch(`/api/merchant/promotions/${promo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      notifySuccess('อัปเดตสถานะแบนเนอร์แล้ว');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const updateSort = async (promo: Promotion, sortOrder: number) => {
    try {
      await apiFetch(`/api/merchant/promotions/${promo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ sortOrder })
      });
      notifySuccess('อัปเดตลำดับแล้ว');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const remove = async (id: number) => {
    try {
      await apiFetch(`/api/merchant/promotions/${id}`, { method: 'DELETE' });
      notifySuccess('ลบแบนเนอร์สำเร็จ');
      load();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แบนเนอร์</h1>
        <p className="text-sm text-slate-500">อัปโหลดแบนเนอร์เพื่อแสดงบนหน้าแรก</p>
      </div>

      <form className="card grid gap-3 p-6 md:grid-cols-2" onSubmit={handleCreate}>
        <input
          name="title"
          placeholder="ชื่อแบนเนอร์"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          name="imageUrl"
          placeholder="ลิงก์รูปภาพ"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          required={!imageData}
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
          name="sortOrder"
          type="number"
          placeholder="ลำดับการแสดงผล"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input name="isActive" type="checkbox" defaultChecked /> เปิดใช้งาน
        </label>
        <button className="btn btn-primary md:col-span-2" type="submit">
          เพิ่มแบนเนอร์
        </button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3">ตัวอย่าง</th>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">ลำดับ</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.id} className="border-t">
                <td className="px-4 py-3">
                  <img
                    src={promo.imageUrl}
                    alt={promo.title || 'แบนเนอร์'}
                    className="h-16 w-28 rounded-lg object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{promo.title || 'แบนเนอร์'}</div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={promo.sortOrder}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                    onBlur={(event) => updateSort(promo, Number(event.target.value))}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="badge">{promo.isActive ? 'เปิดใช้งาน' : 'ซ่อน'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline" onClick={() => toggleActive(promo)}>
                      {promo.isActive ? 'ปิด' : 'เปิด'}
                    </button>
                    <button className="btn btn-outline" onClick={() => remove(promo.id)}>
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
