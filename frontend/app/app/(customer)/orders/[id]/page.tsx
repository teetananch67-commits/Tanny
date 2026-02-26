'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, Order } from '../../../../lib/api';

const STATUS_FLOW = [
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'COOKING',
  'READY',
  'COMPLETED'
];
const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PAID: 'ชำระเงินแล้ว',
  CONFIRMED: 'ร้านยืนยัน',
  COOKING: 'กำลังทำอาหาร',
  READY: 'พร้อมรับสินค้า',
  COMPLETED: 'สำเร็จ',
  REJECTED: 'ร้านปฏิเสธ',
  CANCELLED: 'ยกเลิกแล้ว'
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchOrder = () => {
      apiFetch<Order>(`/api/orders/${id}`).then((data) => {
        if (mounted) setOrder(data);
      });
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  const currentIndex = useMemo(() => {
    if (!order) return -1;
    return STATUS_FLOW.indexOf(order.status);
  }, [order]);

  if (!order) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-500">กำลังโหลดออเดอร์...</p>
      </div>
    );
  }

  const address = order.addressSnapshot || null;
  const createdAt = new Date(order.createdAt).toLocaleString('th-TH');

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-sm text-slate-500">ออเดอร์ {order.orderNo}</div>
        <h1 className="text-2xl font-semibold">
          สถานะ: {STATUS_LABEL[order.status] || order.status}
        </h1>
        <div className="mt-2 text-sm text-slate-500">สร้างเมื่อ {createdAt}</div>
        <div className="mt-4 grid gap-2">
          {STATUS_FLOW.map((status, index) => (
            <div key={status} className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  index <= currentIndex ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              />
              <div className={index <= currentIndex ? 'text-slate-900' : 'text-slate-500'}>
                {STATUS_LABEL[status] || status}
              </div>
            </div>
          ))}
          {['REJECTED', 'CANCELLED'].includes(order.status) && (
            <div className="mt-2 text-sm text-red-500">
              {STATUS_LABEL[order.status] || order.status}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">ข้อมูลลูกค้า</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-600">
          <div>
            <span className="text-slate-500">ชื่อ:</span> {order.customerNameSnapshot || '-'}
          </div>
          <div>
            <span className="text-slate-500">เบอร์โทร:</span> {order.customerPhoneSnapshot || '-'}
          </div>
          <div>
            <span className="text-slate-500">ที่อยู่:</span> {address?.line1 || '-'}
          </div>
          {address?.note && (
            <div>
              <span className="text-slate-500">หมายเหตุ:</span> {address.note}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">รายการอาหาร</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{item.nameSnapshot}</div>
                <div className="text-sm text-slate-500">จำนวน {item.qty}</div>
              </div>
              <div className="font-semibold">THB {Number(item.total).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t pt-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>ยอดรวม</span>
            <span>THB {Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ค่าจัดส่ง</span>
            <span>THB {Number(order.deliveryFee).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
            <span>ทั้งหมด</span>
            <span>THB {Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}