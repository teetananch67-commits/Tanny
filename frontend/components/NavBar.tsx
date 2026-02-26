'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

// นำ { href: '/orders', label: 'ออเดอร์' } ออกแล้ว
const links = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/cart', label: 'ตะกร้า' }
];

export function NavBar() {
  const pathname = usePathname();
  const { items } = useCart();
  const { user, openAuth, logout } = useAuth();
  
  return (
    <nav className="sticky top-0 z-40 border-b border-orange-200 bg-orange-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        <Link href="/" className="text-lg font-semibold tracking-tight text-orange-700">
          Baan Tanluck
        </Link>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'transition flex items-center',
                pathname === link.href
                  ? 'text-orange-600 font-semibold'
                  : 'text-orange-500 hover:text-orange-700'
              )}
            >
              {link.label}

              {/* badge ตะกร้า - แสดงจำนวนรวมชิ้นของทั้งหมด */}
              {link.href === '/cart' && items.length > 0 ? (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white">
                  {items.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              ) : null}
            </Link>
          ))}

       
        </div>
      </div>
    </nav>
  );
}