'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export default function AdminSidebarLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-teal-light text-teal-dark' : 'text-ink hover:bg-surface2'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
