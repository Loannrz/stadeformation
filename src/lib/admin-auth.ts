export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function getAdminSessionToken(): string | undefined {
  return process.env.ADMIN_SESSION_TOKEN;
}

export async function isAdminSession(): Promise<boolean> {
  const { cookies } = await import('next/headers');
  const sessionToken = getAdminSessionToken();
  const cookieStore = await cookies();
  return Boolean(sessionToken && cookieStore.get('admin-token')?.value === sessionToken);
}
