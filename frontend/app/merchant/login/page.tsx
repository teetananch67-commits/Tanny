'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../components/AuthContext';
import { useAlert } from '../../../components/AlertContext';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { notifySuccess, notifyError } = useAlert();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const user = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (user.role !== 'MERCHANT_ADMIN') {
        const msg = 'บัญชีนี้ไม่ใช่ผู้ดูแลร้าน';
        setError(msg);
        notifyError(msg);
        return;
      }
      setUser(user);
      notifySuccess('เข้าสู่ระบบสำเร็จ');
      router.push('/merchant/dashboard');
    } catch (err: any) {
      const msg = err.message || 'เข้าสู่ระบบไม่สำเร็จ';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">เข้าสู่ระบบหลังบ้าน</h1>
        <p className="text-sm text-slate-500">จัดการออเดอร์และเมนูของร้าน</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="อีเมล"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            required
          />
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
