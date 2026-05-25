import AdminSidebar from './_components/AdminSidebar';
import { ConfirmProvider } from '@/components/admin/ConfirmProvider';
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
    <ConfirmProvider>
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </ConfirmProvider>
  );
}
