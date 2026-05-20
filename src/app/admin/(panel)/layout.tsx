import AdminSidebar from './_components/AdminSidebar';
import styles from './admin.module.css';

export const metadata = {
  title: 'Giviu Admin',
  robots: 'noindex, nofollow',
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
