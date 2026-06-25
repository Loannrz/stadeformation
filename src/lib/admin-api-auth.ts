import { cookies } from 'next/headers';
import { getAdminSessionToken } from '@/lib/admin-auth';

export async function isAdminApiAuthorized(): Promise<boolean> {
  const sessionToken = getAdminSessionToken();
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return Boolean(sessionToken && token?.value === sessionToken);
}
