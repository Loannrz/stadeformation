import { NextResponse } from 'next/server';
import { getAdminPassword, getAdminSessionToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const password = getAdminPassword();
  const sessionToken = getAdminSessionToken();

  if (!password || !sessionToken) {
    return NextResponse.json(
      { error: 'Configuration serveur manquante (ADMIN_PASSWORD / ADMIN_SESSION_TOKEN)' },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { password?: string };

  if (body.password !== password) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('admin-token');
  return res;
}
