'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../../login/actions';
import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/inquiries', label: 'Zapytania', icon: '✉️' },
  { href: '/admin/offers', label: 'Oferty', icon: '📄' },
  { href: '/admin/orders', label: 'Zamówienia', icon: '📦' },
  { href: '/admin/clients', label: 'Klienci', icon: '🏢' },
  { href: '/admin/tasks', label: 'Zadania', icon: '✓' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandText}>Giviu</span>
        <span className={styles.brandSub}>Admin</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
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
