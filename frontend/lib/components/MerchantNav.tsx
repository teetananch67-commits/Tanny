'use client';

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from './AuthContext';

const merchantLinks = [
  { href: '/merchant/dashboard', label: 'แดชบอร์ด' },
  { href: '/merchant/orders', label: 'ออเดอร์' },
  { href: '/merchant/promotions', label: 'แบนเนอร์' },
  { href: '/merchant/menu', label: 'เมนู' },
  { href: '/merchant/categories', label: 'หมวดหมู่' },
  { href: '/merchant/settings', label: 'ตั้งค่า' }
];

export function MerchantNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return null;
  }
  if (!user || user.role !== 'MERCHANT_ADMIN') {
    return null;
  }
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-6 text-lg font-semibold">Dashboard</div>
      <div className="flex flex-col gap-2 text-sm">
        {merchantLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'rounded-lg px-3 py-2 transition',
              pathname === link.href ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-6">
        <button
          className="btn btn-outline w-full"
          onClick={async () => {
            await logout();
            router.push('/merchant/login');
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
