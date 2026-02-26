'use client';

import Link from 'next/link';
import { useCart } from '../../../components/CartContext';

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

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
                >
                  -
                </button>
                <span className="w-8 text-center">{item.qty}</span>
                <button
                  className="btn btn-outline"
                  onClick={() => updateQty(item.menuItemId, item.qty + 1)}
                >
                  +
                </button>
                <button className="btn btn-outline" onClick={() => removeItem(item.menuItemId)}>
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">สรุปรายการ</h2>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>ยอดรวม</span>
          <span>THB {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>ค่าจัดส่ง</span>
          <span>THB 0.00</span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>ทั้งหมด</span>
          <span>THB {subtotal.toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary">
          ไปชำระเงิน
        </Link>
      </div>
    </div>
  );
}
