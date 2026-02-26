'use client';

import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth, User } from './AuthContext';
import { useAlert } from './AlertContext';

export function AuthPanel({ onAuthed }: { onAuthed?: (user: User | null) => void }) {
  const { user, setUser } = useAuth();
  const { notifySuccess, notifyError } = useAlert();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload: any = Object.fromEntries(form.entries());

    try {
      if (mode === 'register') {
        const data = await apiFetch<User>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setUser(data);
        onAuthed?.(data);
        notifySuccess('สมัครสมาชิกสำเร็จ');
      } else {
        const data = await apiFetch<User>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setUser(data);
        onAuthed?.(data);
        notifySuccess('เข้าสู่ระบบสำเร็จ');
      }
    } catch (err: any) {
      const msg = err.message || 'ทำรายการไม่สำเร็จ';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="card p-4">
        <div className="text-sm text-slate-500">เข้าสู่ระบบแล้ว</div>
        <div className="text-lg font-semibold">{user.name}</div>
        <div className="text-xs text-slate-500">{user.email}</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>
        <button
          className="badge"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </button>
      </div>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            name="name"
            placeholder="ชื่อ-นามสกุล"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            required
          />
        )}
        {mode === 'register' && (
          <input
            name="phone"
            placeholder="เบอร์โทร"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        )}
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
        <button disabled={loading} className="btn btn-primary w-full" type="submit">
          {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>
      </form>
    </div>
  );
}
