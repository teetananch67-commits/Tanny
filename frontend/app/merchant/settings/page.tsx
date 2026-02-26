'use client';

import { useEffect, useState } from 'react';
import { apiFetch, RestaurantSettings } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

export default function MerchantSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useAlert();

  useEffect(() => {
    apiFetch<RestaurantSettings>('/api/settings').then(setSettings).catch(() => setSettings(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const payload = {
        deliveryFee: Number(form.get('deliveryFee') || 0),
        openHours: String(form.get('openHours') || ''),
        qrImageUrl: qrData || String(form.get('qrImageUrl') || ''),
        acceptCash: form.get('acceptCash') === 'on'
      };
      const updated = await apiFetch<RestaurantSettings>('/api/merchant/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setSettings(updated);
      setQrData(null);
      notifySuccess('บันทึกการตั้งค่าสำเร็จ');
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
        <p className="text-sm text-slate-500">ตั้งค่าค่าจัดส่ง เวลาเปิดปิด และช่องทางชำระเงิน</p>
      </div>
      <form className="card grid gap-4 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium">ค่าจัดส่ง</label>
          <input
            type="number"
            name="deliveryFee"
            step="0.01"
            defaultValue={settings?.deliveryFee ?? 0}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">เวลาเปิด-ปิด</label>
          <input
            name="openHours"
            defaultValue={settings?.openHours ?? '09:00 - 21:00'}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">ลิงก์รูป QR</label>
          <input
            name="qrImageUrl"
            defaultValue={settings?.qrImageUrl ?? ''}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setQrData(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input name="acceptCash" type="checkbox" defaultChecked={settings?.acceptCash ?? true} /> รับเงินสด
        </label>
        <button className="btn btn-primary md:col-span-2" type="submit" disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </form>
    </div>
  );
}
