'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, Order } from '../../../lib/api';
import { useAlert } from '../../../components/AlertContext';

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { notifySuccess, notifyError } = useAlert();

  const loadOrders = () => {
    apiFetch<Order[]>('/api/merchant/orders')
      .then(setOrders)
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (orderId: number, currentStatus: string, type: 'next' | 'reject') => {
    try {
      let url = '';
      let body = undefined;

      if (type === 'reject') {
        url = `/api/merchant/orders/${orderId}/reject`;
      } else {
        // --- LOGIC แก้ไข INVALID STATUS TRANSITION ทีละ Step ---
        
        // Step 0: ถ้าค้างที่ PENDING_PAYMENT ให้บังคับเป็น PAID ก่อน
        if (currentStatus === 'PENDING_PAYMENT') {
          url = `/api/merchant/orders/${orderId}/status`;
          body = JSON.stringify({ status: 'PAID' });
        } 
        // Step 1: ถ้าเป็น PAID แล้ว ให้กด Confirm (ยืนยัน)
        else if (currentStatus === 'PAID') {
          url = `/api/merchant/orders/${orderId}/confirm`;
        } 
        // Step 2: ถ้าได้รับการยืนยันแล้ว -> ไป COOKING
        else if (currentStatus === 'CONFIRMED') {
          url = `/api/merchant/orders/${orderId}/status`;
          body = JSON.stringify({ status: 'COOKING' });
        }
        // Step 3: ถ้ากำลังทำ -> ไป COMPLETED (ผ่าน READY)
        else if (currentStatus === 'COOKING') {
          // ลองส่งไป READY ก่อนเพื่อให้ Backend ยอมรับ transition
          url = `/api/merchant/orders/${orderId}/status`;
          body = JSON.stringify({ status: 'READY' });
        }
        else if (currentStatus === 'READY') {
          url = `/api/merchant/orders/${orderId}/status`;
          body = JSON.stringify({ status: 'COMPLETED' });
        }
      }

      if (!url) return;

      await apiFetch(url, { method: 'POST', body });
      notifySuccess('ดำเนินการสำเร็จ');
      loadOrders(); // รีโหลดข้อมูล
    } catch (err: any) {
      notifyError(`Error (${currentStatus}): ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">ออเดอร์อาหาร</h1>
      
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-5 text-center">ออเดอร์</th>
              <th className="px-6 py-5 text-center">สถานะปัจจุบัน</th>
              <th className="px-6 py-5 text-center">การจัดการ</th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => {
              const s = order.status;
              const isCancelled = ['REJECTED', 'CANCELLED'].includes(s);

              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-center font-black text-slate-900">#{order.orderNo}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-tight">
                      {s}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      {!isCancelled && s !== 'COMPLETED' && (
                        <>
                          {/* ปุ่มสำหรับสถานะ PENDING_PAYMENT */}
                          {s === 'PENDING_PAYMENT' && (
                            <button onClick={() => handleAction(order.id, s, 'next')} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100">
                              ยืนยันชำระเงิน
                            </button>
                          )}

                          {/* ปุ่มสำหรับสถานะ PAID */}
                          {s === 'PAID' && (
                            <button onClick={() => handleAction(order.id, s, 'next')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">
                              รับออเดอร์
                            </button>
                          )}
                          
                          {/* ปุ่มสำหรับสถานะ CONFIRMED */}
                          {s === 'CONFIRMED' && (
                            <button onClick={() => handleAction(order.id, s, 'next')} className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-orange-100">
                              เริ่มทำอาหาร
                            </button>
                          )}

                          {/* ปุ่มสำหรับสถานะ COOKING / READY */}
                          {(s === 'COOKING' || s === 'READY') && (
                            <button onClick={() => handleAction(order.id, s, 'next')} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-green-100">
                              ทำรายการสำเร็จ
                            </button>
                          )}

                          {/* ปุ่มปฏิเสธ (ยกเลิก) */}
                          {['PENDING_PAYMENT', 'PAID', 'CONFIRMED'].includes(s) && (
                            <button onClick={() => handleAction(order.id, s, 'reject')} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors">
                              ปฏิเสธ
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold underline text-slate-400 hover:text-slate-900">
                    <Link href={`/merchant/orders/${order.id}`}>เปิดดู</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}