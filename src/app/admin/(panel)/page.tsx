import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import styles from './admin.module.css';
import dashboardStyles from './Dashboard.module.css';

export default async function AdminDashboard() {
  const supabase = supabaseServer;

  // Statystyki
  const [
    { count: draftCount },
    { count: sentCount },
    { count: acceptedCount },
    { count: inquiriesCount },
  ] = await Promise.all([
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const stats = [
    { label: 'Nowe zapytania', value: inquiriesCount ?? 0, href: '/admin/inquiries' },
    { label: 'Oferty robocze', value: draftCount ?? 0, href: '/admin/offers?status=draft' },
    { label: 'Oferty wysłane', value: sentCount ?? 0, href: '/admin/offers?status=sent' },
    { label: 'Zaakceptowane', value: acceptedCount ?? 0, href: '/admin/offers?status=accepted' },
  ];

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <Link href="/admin/offers" className={styles.btnPrimary}>
          Przejdź do ofert →
        </Link>
      </header>

      <div className={dashboardStyles.statsGrid}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={dashboardStyles.statCard}>
            <div className={dashboardStyles.statValue}>{stat.value}</div>
            <div className={dashboardStyles.statLabel}>{stat.label}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
