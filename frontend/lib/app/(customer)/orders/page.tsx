'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, Order } from '../../../lib/api';
import { AuthPanel } from '../../../components/AuthPanel';
import { useCart } from '../../../components/CartContext';
import { useAlert } from '../../../components/AlertContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const { clear, addItem } = useCart();
  const { notifySuccess, notifyError } = useAlert();
  const statusLabel: Record<string, string> = {
    PENDING_PAYMENT: 'รอชำระเงิน',
    PAID: 'ชำระเงินแล้ว',
    CONFIRMED: 'ร้านยืนยัน',
    COOKING: 'กำลังทำอาหาร',
    READY: 'พร้อมรับสินค้า',
    COMPLETED: 'สำเร็จ',
    REJECTED: 'ร้านปฏิเสธ',
    CANCELLED: 'ยกเลิกแล้ว'
  };

  const loadOrders = () => {
    apiFetch<Order[]>('/api/orders')
      .then((data) => {
        setOrders(data);
        setAuthed(true);
      })
      .catch(() => {
        setOrders([]);
        setAuthed(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReorder = async (orderId: number) => {
    setError('');
    try {
      const order = await apiFetch<Order>(`/api/orders/${orderId}`);
      clear();
      order.items.forEach((item) => {
        addItem({
          menuItemId: item.menuItemId,
          name: item.nameSnapshot,
          price: Number(item.priceSnapshot),
          qty: item.qty
        });
      });
      notifySuccess('เพิ่มรายการลงตะกร้าแล้ว');
    } catch (err: any) {
      const msg = err.message || 'สั่งซ้ำไม่สำเร็จ';
      setError(msg);
      notifyError(msg);
    }
  };

  if (!authed) {
    return (
      <div className="space-y-4">
        <AuthPanel
          onAuthed={(user) => {
            const ok = Boolean(user);
            setAuthed(ok);
            if (ok) loadOrders();
          }}
        />
        <p className="text-sm text-slate-500">เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ออเดอร์</h1>
        <p className="text-sm text-slate-500">ติดตามสถานะและสั่งซ้ำได้ทันที</p>
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-slate-500">ออเดอร์ {order.orderNo}</div>
                <div className="text-lg font-semibold">
                  {statusLabel[order.status] || order.status}
                </div>
              </div>
              <div className="text-lg font-semibold">THB {Number(order.total).toFixed(2)}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/orders/${order.id}`} className="btn btn-outline">
                ดูรายละเอียด
              </Link>
              <button className="btn btn-primary" onClick={() => handleReorder(order.id)}>
                สั่งอีกครั้ง
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
