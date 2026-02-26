'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, RestaurantSettings } from '../../../lib/api';
import { useCart } from '../../../components/CartContext';
import { useAuth } from '../../../components/AuthContext';
import { AuthPanel } from '../../../components/AuthPanel';
import { useAlert } from '../../../components/AlertContext';

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart();
  const { user, openAuth } = useAuth();
  const { notifySuccess, notifyError } = useAlert();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QR_CODE' | 'CASH'>('QR_CODE');
  const [slipImageUrl, setSlipImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

  const deliveryFee = Number(settings?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

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
      const order = await apiFetch<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ menuItemId: item.menuItemId, qty: item.qty })),
          deliveryFee
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
      if (err?.message === 'Unauthorized') {
        const msg = 'กรุณาเข้าสู่ระบบก่อนชำระเงิน';
        setError(msg);
        notifyError(msg);
        openAuth();
        return;
      }
      const msg = err.message || 'ชำระเงินไม่สำเร็จ';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">ตะกร้าของคุณว่างอยู่</h1>
        <p className="mt-2 text-slate-600">เลือกเมนูที่ชอบแล้วเพิ่มลงตะกร้าได้เลย</p>
        <Link href="/" className="btn btn-primary mt-4">
          กลับหน้าเมนู
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">ตะกร้า</h1>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-slate-500">THB {item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => updateQty(item.menuItemId, item.qty - 1)}
                  type="button"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.qty}</span>
                <button
                  className="btn btn-outline"
                  onClick={() => updateQty(item.menuItemId, item.qty + 1)}
                  type="button"
                >
                  +
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => removeItem(item.menuItemId)}
                  type="button"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {!user && <AuthPanel />}
        <form className="card space-y-4 p-6" onSubmit={handlePay}>
          <h2 className="text-xl font-semibold">ชำระเงิน</h2>

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

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold">สรุปรายการ</h2>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>ยอดรวม</span>
            <span>THB {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>ค่าจัดส่ง</span>
            <span>THB {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>ทั้งหมด</span>
            <span>THB {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
