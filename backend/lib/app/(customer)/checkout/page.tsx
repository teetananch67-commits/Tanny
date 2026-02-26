'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, Address, RestaurantSettings } from '../../../lib/api';
import { useCart } from '../../../components/CartContext';
import { AuthPanel } from '../../../components/AuthPanel';
import { useAuth } from '../../../components/AuthContext';
import { useAlert } from '../../../components/AlertContext';

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, openAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QR_CODE' | 'CASH'>('QR_CODE');
  const [slipImageUrl, setSlipImageUrl] = useState<string | null>(null);
  const [line1, setLine1] = useState('');
  const [note, setNote] = useState('');
  const { notifySuccess, notifyError } = useAlert();
  const router = useRouter();

  const loadAddresses = async () => {
    if (!user) return;
    const data = await apiFetch<Address[]>('/api/addresses');
    setAddresses(data);
    const defaultAddr = data.find((addr) => addr.isDefault);
    setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0]?.id ?? null);
  };

  useEffect(() => {
    apiFetch<RestaurantSettings>('/api/settings')
      .then((data) => {
        setSettings(data);
        if (data && !data.acceptCash) {
          setPaymentMethod('QR_CODE');
        }
      })
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    loadAddresses().catch(() => setAddresses([]));
  }, [user]);

  const deliveryFee = Number(settings?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  const handleSaveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    try {
      const formEl = event.currentTarget;
      const form = new FormData(formEl);
      const payload = Object.fromEntries(form.entries());
      await apiFetch<Address>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label: payload.label,
          recipientName: payload.recipientName,
          phone: payload.phone,
          line1: payload.line1,
          note: payload.note,
          isDefault: payload.isDefault === 'on'
        })
      });
      formEl.reset();
      notifySuccess('บันทึกที่อยู่แล้ว');
      await loadAddresses();
    } catch (err: any) {
      notifyError(err.message || 'บันทึกที่อยู่ไม่สำเร็จ');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await apiFetch(`/api/addresses/${id}/default`, { method: 'POST' });
      notifySuccess('ตั้งเป็นค่าเริ่มต้นแล้ว');
      await loadAddresses();
    } catch (err: any) {
      notifyError(err.message || 'ตั้งค่าไม่สำเร็จ');
    }
  };

  const handlePay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนชำระเงิน');
      openAuth();
      return;
    }
    if (items.length === 0) {
      setError('ตะกร้าว่าง');
      return;
    }
    if (paymentMethod === 'QR_CODE' && !slipImageUrl) {
      setError('กรุณาอัปโหลดสลิปสำหรับการชำระแบบ QR');
      return;
    }

    setLoading(true);
    try {
      const address = {
        line1,
        note
      };

      const order = await apiFetch<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ menuItemId: item.menuItemId, qty: item.qty })),
          address,
          addressId: selectedAddressId
        })
      });

      await apiFetch<any>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          method: paymentMethod,
          slipImageUrl: paymentMethod === 'QR_CODE' ? slipImageUrl : null
        })
      });

      clear();
      notifySuccess('ชำระเงินสำเร็จ');
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      const msg = err.message || 'ชำระเงินไม่สำเร็จ';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = useMemo(() => {
    return addresses.find((addr) => addr.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (selectedAddress) {
      setLine1(selectedAddress.line1);
      setNote(selectedAddress.note || '');
    } else {
      setLine1('');
      setNote('');
    }
  }, [selectedAddress]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <form className="card space-y-4 p-6" onSubmit={handlePay}>
        <h1 className="text-2xl font-semibold">ชำระเงิน</h1>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ที่อยู่ที่บันทึกไว้</h2>
              <span className="text-xs text-slate-500">เลือกใช้สำหรับออเดอร์นี้</span>
            </div>
            <div className="grid gap-2">
              {addresses.map((addr) => (
                <label key={addr.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input
                    type="radio"
                    name="addressSelect"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">{addr.label}</div>
                    <div className="text-slate-500">{addr.line1}</div>
                  </div>
                  {addr.isDefault ? (
                    <span className="badge">ค่าเริ่มต้น</span>
                  ) : (
                    <button type="button" className="badge" onClick={() => handleSetDefault(addr.id)}>
                      ตั้งเป็นค่าเริ่มต้น
                    </button>
                  )}
                </label>
              ))}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedAddressId(null)}
              >
                ใช้ที่อยู่อื่น
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">เข้าสู่ระบบเพื่อเลือกหรือบันทึกที่อยู่</div>
        )}

        <div>
          <label className="text-sm font-medium">ที่อยู่จัดส่ง</label>
          <input
            name="line1"
            placeholder="ที่อยู่"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={line1}
            onChange={(event) => {
              setLine1(event.target.value);
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            required={!selectedAddressId}
            disabled={Boolean(selectedAddressId)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">หมายเหตุถึงร้าน</label>
          <input
            name="note"
            placeholder="ใส่หมายเหตุ"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            disabled={Boolean(selectedAddressId)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">วิธีชำระเงิน</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'QR_CODE'}
                onChange={() => setPaymentMethod('QR_CODE')}
              />
              คิวอาร์โค้ด
            </label>
            {settings?.acceptCash && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                />
                เงินสดเมื่อมารับสินค้า
              </label>
            )}
          </div>
        </div>

        {paymentMethod === 'QR_CODE' && (
          <div className="space-y-3">
            {settings?.qrImageUrl ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <img
                  src={settings.qrImageUrl}
                  alt="QR code"
                  className="mx-auto h-56 w-full max-w-md object-contain"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                ยังไม่ได้ตั้งค่า QR
              </div>
            )}
            <div>
              <label className="text-sm font-medium">อัปโหลดสลิป</label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setSlipImageUrl(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
        </button>
      </form>

      <div className="space-y-4">
        {!user && <AuthPanel onAuthed={() => loadAddresses()} />}
        <div className="card p-6">
          <h2 className="text-lg font-semibold">บันทึกที่อยู่ใหม่</h2>
          <form className="mt-4 space-y-3" onSubmit={handleSaveAddress}>
            <input
              name="label"
              placeholder="ชื่อที่อยู่ (บ้าน, ที่ทำงาน)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <input
              name="recipientName"
              placeholder="ชื่อผู้รับ"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <input
              name="phone"
              placeholder="เบอร์โทร"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="line1"
              placeholder="ที่อยู่"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <input
              name="note"
              placeholder="หมายเหตุ"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input name="isDefault" type="checkbox" /> ตั้งเป็นค่าเริ่มต้น
            </label>
            <button className="btn btn-outline w-full" type="submit">
              บันทึกที่อยู่
            </button>
          </form>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">สรุปรายการ</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>ยอดรวม</span>
            <span>THB {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>ค่าจัดส่ง</span>
            <span>THB {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-lg font-semibold">
            <span>ทั้งหมด</span>
            <span>THB {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
