'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../../login/actions';
import styles from './AdminSidebar.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface Props {
  newInquiriesCount: number;
}

export default function AdminSidebarClient({ newInquiriesCount }: Props) {
  const pathname = usePathname();

  const NAV_ITEMS: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    {
      href: '/admin/inquiries',
      label: 'Zapytania',
      icon: '✉️',
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { href: '/admin/offers', label: 'Oferty', icon: '📄' },
    { href: '/admin/orders', label: 'Zamówienia', icon: '📦' },
    { href: '/admin/orders/history', label: 'Historia zamówień', icon: '🗂️' },
    { href: '/admin/clients', label: 'Klienci', icon: '🏢' },
    { href: '/admin/suppliers', label: 'Dostawcy', icon: '🚚' },
    { href: '/admin/tasks', label: 'Zadania', icon: '✓' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandText}>Giviu</span>
        <span className={styles.brandSub}>Admin</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          let isActive: boolean;
          if (item.href === '/admin') {
            isActive = pathname === '/admin';
          } else if (item.href === '/admin/orders') {
            isActive =
              pathname === '/admin/orders' ||
              (pathname.startsWith('/admin/orders/') &&
                !pathname.startsWith('/admin/orders/history'));
          } else {
            isActive = pathname.startsWith(item.href);
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge !== undefined && (
                <span className={styles.navBadge} aria-label={`${item.badge} nowych`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className={styles.logoutForm}>
        <button type="submit" className={styles.logout}>
          Wyloguj
        </button>
      </form>
    </aside>
  );
}
