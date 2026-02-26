'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Dashboard = {
  daily: { orders: number; revenue: number };
  monthly: { orders: number; revenue: number };
  topItems: { nameSnapshot: string; _sum: { qty: number } }[];
};

export default function MerchantDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    apiFetch<Dashboard>('/api/merchant/dashboard')
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
        <p className="text-sm text-slate-500">สรุปยอดรายวันและรายเดือน</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm text-slate-500">วันนี้</div>
          <div className="mt-2 text-2xl font-semibold">{data?.daily.orders ?? 0} ออเดอร์</div>
          <div className="text-sm text-slate-500">รายได้ THB {Number(data?.daily.revenue ?? 0).toFixed(2)}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-slate-500">เดือนนี้</div>
          <div className="mt-2 text-2xl font-semibold">{data?.monthly.orders ?? 0} ออเดอร์</div>
          <div className="text-sm text-slate-500">รายได้ THB {Number(data?.monthly.revenue ?? 0).toFixed(2)}</div>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold">เมนูขายดี</h2>
        <div className="mt-4 space-y-2 text-sm">
          {data?.topItems?.length ? (
            data.topItems.map((item) => (
              <div key={item.nameSnapshot} className="flex items-center justify-between">
                <span>{item.nameSnapshot}</span>
                <span>{item._sum.qty ?? 0} รายการ</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500">ยังไม่มีข้อมูล</div>
          )}
        </div>
      </div>
    </div>
  );
}
