'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, Order } from '../../../../lib/api';

const STEPS = ['รับออเดอร์แล้ว', 'กำลังเตรียมรายการ', 'ทำรายการสำเร็จ'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = () => apiFetch<Order>(`/api/orders/${id}`).then(setOrder).catch(() => {});
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // เช็คสถานะใหม่ทุก 4 วินาที
    return () => clearInterval(interval);
  }, [id]);

  const currentStep = useMemo(() => {
    if (!order) return -1;
    if (order.status === 'COMPLETED') return 2;
    if (['COOKING', 'READY'].includes(order.status)) return 1;
    if (['PENDING_PAYMENT', 'PAID', 'CONFIRMED'].includes(order.status)) return 0;
    return -1; // กรณี REJECTED หรือ CANCELLED
  }, [order]);

  if (!order) return <div className="p-20 text-center text-slate-400 animate-bounce">กำลังเปิดดูข้อมูลออเดอร์...</div>;

  const isCancelled = ['REJECTED', 'CANCELLED'].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-6">
      {/* ส่วนแสดงสถานะแบบ Stepper */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
        <div className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Tracking</div>
        <h1 className={`text-3xl font-black mb-10 ${isCancelled ? 'text-red-500' : 'text-slate-900'}`}>
          {isCancelled ? 'ออเดอร์ถูกยกเลิก' : STEPS[currentStep]}
        </h1>

        {!isCancelled ? (
          <div className="relative flex justify-between items-start max-w-md mx-auto">
            {/* เส้นพื้นหลัง */}
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-0" />
            {/* เส้นความคืบหน้า */}
            <div 
              className="absolute top-5 left-0 h-1 bg-slate-900 transition-all duration-1000 -z-0"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            
            {STEPS.map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center flex-1">
                <div className={`h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                  i <= currentStep ? 'bg-slate-900 border-white text-white shadow-lg' : 'bg-white border-slate-50 text-slate-200'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <div className={`mt-3 text-[10px] font-black uppercase tracking-tighter ${i <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm">
            ขออภัย ออเดอร์ของคุณถูกยกเลิกโดยทางร้าน
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* รายการอาหาร */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100">
          <h2 className="font-black text-slate-900 mb-4">รายการอาหาร</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">{item.nameSnapshot} <span className="text-slate-400">x{item.qty}</span></span>
                <span className="font-bold text-slate-900">฿{Number(item.total).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-dashed space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-bold">
              <span>ยอดรวมอาหาร</span>
              <span>฿{Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-bold border-b pb-2">
              <span>ค่าจัดส่ง</span>
              <span>฿{Number(order.deliveryFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 text-xl font-black text-slate-900">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>฿{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ข้อมูลการจัดส่ง */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-fit">
          <h2 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-wide">ข้อมูลลูกค้า</h2>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">ชื่อผู้รับ</div>
              <div className="font-bold text-slate-700">{order.customerNameSnapshot || 'ไม่ระบุชื่อ'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">ที่อยู่จัดส่ง</div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed">{order.addressSnapshot?.line1 || 'รับที่ร้าน'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}