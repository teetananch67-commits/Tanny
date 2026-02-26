'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

const links = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/orders', label: 'ออเดอร์' },
  { href: '/cart', label: 'ตะกร้า' }
];

export function NavBar() {
  const pathname = usePathname();
  const { items } = useCart();
  const { user, openAuth, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Restaurants
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'transition',
                pathname === link.href ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {link.label}
              {link.href === '/cart' && items.length > 0 ? (
                <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                  {items.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              ) : null}
            </Link>
          ))}
          {user ? (
            <button className="badge" onClick={() => logout()}>
              ออกจากระบบ
            </button>
          ) : (
            <button className="badge" onClick={openAuth}>
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
