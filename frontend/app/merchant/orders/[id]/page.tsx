'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, Order } from '../../../../lib/api';
import { useAlert } from '../../../../components/AlertContext';

export default function MerchantOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { notifySuccess, notifyError } = useAlert();
  const [order, setOrder] = useState<Order | null>(null);

  const load = () => {
    apiFetch<Order>(`/api/merchant/orders/${id}`).then(setOrder).catch(() => setOrder(null));
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (actionType: 'next' | 'reject') => {
    if (!order) return;
    try {
      let url = '';
      let body = undefined;

      if (actionType === 'reject') {
        url = `/api/merchant/orders/${id}/reject`;
      } else {
        const s = order.status;
        if (['PAID', 'PENDING_PAYMENT', 'PENDING'].includes(s)) url = `/api/merchant/orders/${id}/confirm`;
        else if (s === 'CONFIRMED') {
          url = `/api/merchant/orders/${id}/status`;
          body = JSON.stringify({ status: 'COOKING' });
        } else {
          url = `/api/merchant/orders/${id}/status`;
          body = JSON.stringify({ status: 'COMPLETED' });
        }
      }
      
      await apiFetch(url, { method: 'POST', body });
      notifySuccess('อัปเดตเรียบร้อย');
      load();
    } catch (err: any) {
      notifyError('ไม่สามารถข้ามขั้นตอนได้: ' + err.message);
    }
  };

  if (!order) return <div className="p-10 text-center">กำลังโหลด...</div>;

  const isCancelled = ['REJECTED', 'CANCELLED'].includes(order.status);
  const isDone = order.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={() => router.back()} className="text-sm font-bold text-slate-400 hover:text-slate-900">← ย้อนกลับ</button>
      
      <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex justify-between items-start mb-10">
          <h1 className="text-4xl font-black text-slate-900">ออเดอร์ #{order.orderNo}</h1>
          <div className={`px-4 py-2 rounded-full font-bold text-xs ${isCancelled ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {order.status}
          </div>
        </div>

        {/* แผงควบคุมร้านค้า */}
        {!isCancelled && !isDone && (
          <div className="flex gap-4 p-6 bg-slate-50 rounded-[2rem] mb-10 border border-slate-100 font-bold">
            {['PAID', 'PENDING_PAYMENT', 'PENDING'].includes(order.status) ? (
              <>
                <button onClick={() => handleAction('next')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl shadow-lg">ยืนยันออเดอร์</button>
                <button onClick={() => handleAction('reject')} className="flex-1 bg-white border border-red-200 text-red-600 py-4 rounded-2xl">ปฏิเสธ</button>
              </>
            ) : (
              <button 
                onClick={() => handleAction('next')} 
                className={`flex-1 py-4 rounded-2xl text-white shadow-lg ${order.status === 'CONFIRMED' ? 'bg-orange-500 shadow-orange-100' : 'bg-green-600 shadow-green-100'}`}
              >
                {order.status === 'CONFIRMED' ? 'เริ่มขั้นตอน: กำลังเตรียมอาหาร' : 'เสร็จสิ้น: ทำรายการสำเร็จ'}
              </button>
            )}
          </div>
        )}

        {/* รายละเอียดสินค้า */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-bold text-slate-900 border-b pb-4 mb-4 uppercase text-xs tracking-widest text-slate-400">รายการที่สั่ง</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center font-bold">
                  <span className="text-slate-700">{item.nameSnapshot} x{item.qty}</span>
                  <span className="text-slate-900">฿{Number(item.total).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-dashed text-2xl font-black flex justify-between">
                <span>ยอดรวมสุทธิ</span>
                <span>฿{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-6 h-fit">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ข้อมูลลูกค้า</h3>
              <p className="text-lg font-bold">{order.customerNameSnapshot}</p>
              <p className="text-orange-400 font-black text-xl">{order.customerPhoneSnapshot}</p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-sm text-slate-300 leading-relaxed">{order.addressSnapshot?.line1}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}