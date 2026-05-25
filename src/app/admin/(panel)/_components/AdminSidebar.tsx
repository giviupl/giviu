import { supabaseServer } from '@/lib/supabase-server';
import AdminSidebarClient from './AdminSidebarClient';

// Server component — pobiera licznik nowych zapytań i przekazuje do client component.
// Dzięki temu badge jest świeży po każdym revalidatePath('/admin/inquiries').
export default async function AdminSidebar() {
  const { count: newInquiriesCount } = await supabaseServer
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  return <AdminSidebarClient newInquiriesCount={newInquiriesCount || 0} />;
}
