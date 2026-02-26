'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, Order } from '../../../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // การ Mapping สถานะหน้าบ้าน
  const getStatusDisplay = (status: string) => {
    if (['REJECTED', 'CANCELLED'].includes(status)) {
      return { label: 'ถูกยกเลิก', color: 'bg-red-50 text-red-600 border-red-100' };
    }
    if (status === 'COMPLETED') {
      return { label: 'ทำรายการสำเร็จ', color: 'bg-green-50 text-green-600 border-green-100' };
    }
    if (['COOKING', 'READY'].includes(status)) {
      return { label: 'กำลังเตรียมรายการ', color: 'bg-orange-50 text-orange-600 border-orange-100' };
    }
    // สำหรับ PENDING_PAYMENT, PAID, CONFIRMED
    return { label: 'รับออเดอร์แล้ว', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  };

  useEffect(() => {
    apiFetch<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">รายการสั่งซื้อของคุณ</h1>
        <p className="text-slate-500">ติดตามสถานะอาหารได้แบบเรียลไทม์</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูล...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-slate-400 mb-4">คุณยังไม่มีรายการสั่งซื้อ</p>
          <Link href="/" className="text-slate-900 font-bold underline">กลับไปเลือกเมนูอาหาร</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const status = getStatusDisplay(order.status);
            return (
              <Link 
                key={order.id} 
                href={`/orders/${order.id}`}
                className="group block bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                      {status.label}
                    </span>
                    <div className="text-lg font-bold text-slate-900">ออเดอร์ #{order.orderNo}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">฿{Number(order.total).toLocaleString()}</div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">ดูรายละเอียด →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}