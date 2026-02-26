'use client';

import { AuthPanel } from './AuthPanel';
import { useAuth } from './AuthContext';

export function AuthModal() {
  const { showAuth, closeAuth } = useAuth();
  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end">
          <button className="badge" onClick={closeAuth}>
            ปิด
          </button>
        </div>
        <div className="mt-3">
          <AuthPanel onAuthed={() => closeAuth()} />
        </div>
      </div>
    </div>
  );
}
