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

  if (loading) return null;
  if (!user || user.role !== 'MERCHANT_ADMIN') return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-orange-200 bg-orange-50 px-4 py-6">
      <div className="mb-6 text-lg font-semibold text-orange-700">Dashboard</div>

      <div className="flex flex-col gap-2 text-sm">
        {merchantLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'rounded-lg px-3 py-2 transition font-medium',
              pathname === link.href
                ? 'bg-orange-600 text-white'
                : 'text-orange-700 hover:bg-orange-100 hover:text-orange-800'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          className="w-full rounded-lg border border-orange-500 px-3 py-2 text-orange-600 transition hover:bg-orange-500 hover:text-white"
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
