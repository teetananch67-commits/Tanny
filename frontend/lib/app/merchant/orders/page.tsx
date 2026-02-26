'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, Order } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

const statuses = [
  'ALL',
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'COOKING',
  'READY',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
];
const statusLabel: Record<string, string> = {
  ALL: 'ทั้งหมด',
  PENDING_PAYMENT: 'รอชำระเงิน',
  PAID: 'ชำระเงินแล้ว',
  CONFIRMED: 'ร้านยืนยัน',
  COOKING: 'กำลังทำอาหาร',
  READY: 'พร้อมรับสินค้า',
  COMPLETED: 'สำเร็จ',
  REJECTED: 'ปฏิเสธ',
  CANCELLED: 'ยกเลิก'
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('ALL');
  const { notifySuccess, notifyError } = useAlert();

  const loadOrders = () => {
    const query = filter === 'ALL' ? '' : `?status=${filter}`;
    apiFetch<Order[]>(`/api/merchant/orders${query}`)
      .then(setOrders)
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await apiFetch(`/api/merchant/orders/${orderId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      notifySuccess('อัปเดตสถานะสำเร็จ');
      loadOrders();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const confirmOrder = async (orderId: number) => {
    try {
      await apiFetch(`/api/merchant/orders/${orderId}/confirm`, { method: 'POST' });
      notifySuccess('ยืนยันออเดอร์แล้ว');
      loadOrders();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const rejectOrder = async (orderId: number) => {
    try {
      await apiFetch(`/api/merchant/orders/${orderId}/reject`, { method: 'POST' });
      notifySuccess('ปฏิเสธออเดอร์แล้ว');
      loadOrders();
    } catch (err: any) {
      notifyError(err.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ออเดอร์</h1>
          <p className="text-sm text-slate-500">ออเดอร์ล่าสุดแบบเรียลไทม์</p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status] || status}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3">ออเดอร์</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">ยอดรวม</th>
              <th className="px-4 py-3">การทำรายการ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold">{order.orderNo}</div>
                  <Link href={`/merchant/orders/${order.id}`} className="text-xs text-slate-500">
                    ดูรายละเอียด
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="badge">{statusLabel[order.status] || order.status}</span>
                </td>
                <td className="px-4 py-3">THB {Number(order.total).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PAID' && (
                      <>
                      <button className="btn btn-primary" onClick={() => confirmOrder(order.id)}>
                        ยืนยัน
                      </button>
                      <button className="btn btn-outline" onClick={() => rejectOrder(order.id)}>
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button className="btn btn-primary" onClick={() => updateStatus(order.id, 'COOKING')}>
                      เริ่มทำอาหาร
                    </button>
                  )}
                  {order.status === 'COOKING' && (
                    <button className="btn btn-primary" onClick={() => updateStatus(order.id, 'READY')}>
                      พร้อมรับสินค้า
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button className="btn btn-primary" onClick={() => updateStatus(order.id, 'COMPLETED')}>
                      เสร็จสิ้น
                    </button>
                  )}
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
