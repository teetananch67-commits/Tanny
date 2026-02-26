'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // นำเข้า useRouter
import { apiFetch, RestaurantSettings } from '../../../lib/api';
import { useCart } from '../../../components/CartContext';

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart(); // เพิ่ม clear
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch<RestaurantSettings>('/api/settings')
      .then((data) => setSettings(data))
      .catch(() => setSettings(null));
  }, []);

  const deliveryFee = Number(settings?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  // ฟังก์ชันสำหรับการสั่งซื้อ
  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      // 1. สร้าง Order ผ่าน API
      const order = await apiFetch<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ menuItemId: item.menuItemId, qty: item.qty })),
          deliveryFee,
        }),
      });

      // 2. ล้างข้อมุลในตะกร้า
      clear();

      // 3. ไปยังหน้าติดตามออเดอร์ (orders/[id])
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="text-2xl font-bold text-slate-900">ตะกร้าของคุณว่างอยู่</h1>
        <p className="mt-2 text-slate-500">ยังไม่มีรายการอาหารในตะกร้า ลองเลือกเมนูที่ชอบดูสิ</p>
        <Link href="/" className="mt-6 rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800">
          ไปหน้าเมนู
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6 px-4">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">ตะกร้าสินค้า</h1>
        <p className="text-slate-500">ตรวจสอบรายการอาหารและจำนวนที่ต้องการ</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* รายการอาหาร */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            {items.map((item) => (
              <div key={item.menuItemId} className="group flex items-center gap-4 p-4 transition-all last:border-0 border-b border-slate-50">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <img 
                    src={item.imageUrl || 'https://picsum.photos/seed/placeholder/200/200'} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm font-medium text-slate-500">฿{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-all"
                    onClick={() => updateQty(item.menuItemId, item.qty - 1)}
                  >–</button>
                  <span className="w-8 text-center font-bold text-slate-900">{item.qty}</span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-all"
                    onClick={() => updateQty(item.menuItemId, item.qty + 1)}
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <span className="text-xs font-bold uppercase">ลบ</span>
                </button>
              </div>
            ))}
          </div>
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900">
             ← เลือกอาหารเพิ่ม
          </Link>
        </div>

        {/* สรุปยอดและการสั่งซื้อ */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/50">
            <h2 className="mb-6 text-xl font-bold text-slate-900">สรุปการสั่งซื้อ</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>ยอดรวมอาหาร</span>
                <span className="text-slate-900">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>ค่าจัดส่ง</span>
                <span className="text-slate-900">฿{deliveryFee.toLocaleString()}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold text-slate-900">ยอดรวมทั้งสิ้น</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">฿{total.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400">รวมภาษีมูลค่าเพิ่มแล้ว</p>
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
               <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                 เมื่อกดสั่งซื้อ ระบบจะสร้างเลขออเดอร์ให้ท่านโดยอัตโนมัติ
               </p>
            </div>
          </div>
          
          <button 
            disabled={loading}
            onClick={handleCheckout}
            className={`w-full rounded-2xl py-4 font-bold text-white shadow-lg transition active:scale-[0.98] ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading ? 'กำลังประมวลผล...' : 'สั่งซื้อสินค้า'}
          </button>
        </div>
      </div>
    </div>
  );
}