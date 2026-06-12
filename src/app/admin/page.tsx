import { redirect } from 'next/navigation';
import { formations } from '@/lib/formations';

export default function AdminPage() {
  if (formations.length > 0) {
    redirect(`/admin/formations/${formations[0].id}`);
  }
  redirect('/admin/formations/new');
}
