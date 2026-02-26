'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, Order } from '../../../../lib/api';

export default function MerchantOrderDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const statusLabel: Record<string, string> = {
    PENDING_PAYMENT: 'รอชำระเงิน',
    PAID: 'ชำระเงินแล้ว',
    CONFIRMED: 'ร้านยืนยัน',
    COOKING: 'กำลังทำอาหาร',
    READY: 'พร้อมรับสินค้า',
    COMPLETED: 'เสร็จสิ้น',
    REJECTED: 'ปฏิเสธ',
    CANCELLED: 'ยกเลิก'
  };

  const load = () => {
    apiFetch<Order>(`/api/merchant/orders/${id}`).then(setOrder).catch(() => setOrder(null));
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status: string) => {
    await apiFetch(`/api/merchant/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    load();
  };

  const confirmOrder = async () => {
    await apiFetch(`/api/merchant/orders/${id}/confirm`, { method: 'POST' });
    load();
  };

  const rejectOrder = async () => {
    await apiFetch(`/api/merchant/orders/${id}/reject`, { method: 'POST' });
    load();
  };

  if (!order) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-500">กำลังโหลด...</p>
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
          {statusLabel[order.status] || order.status}
        </h1>
        <div className="mt-2 text-sm text-slate-500">สร้างเมื่อ {createdAt}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {order.status === 'PAID' && (
            <>
              <button className="btn btn-primary" onClick={confirmOrder}>
                ยืนยัน
              </button>
              <button className="btn btn-outline" onClick={rejectOrder}>
                ปฏิเสธ
              </button>
            </>
          )}
          {order.status === 'CONFIRMED' && (
            <button className="btn btn-primary" onClick={() => updateStatus('COOKING')}>
              เริ่มทำอาหาร
            </button>
          )}
          {order.status === 'COOKING' && (
            <button className="btn btn-primary" onClick={() => updateStatus('READY')}>
              พร้อมรับสินค้า
            </button>
          )}
          {order.status === 'READY' && (
            <button className="btn btn-primary" onClick={() => updateStatus('COMPLETED')}>
              เสร็จสิ้น
            </button>
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