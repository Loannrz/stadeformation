import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getAdminSessionToken } from '@/lib/admin-auth';
import { readIaConfig, writeIaConfig, type IaConfig } from '@/lib/ia-flow';

async function isAuthorized(): Promise<boolean> {
  const sessionToken = getAdminSessionToken();
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return Boolean(sessionToken && token?.value === sessionToken);
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const config = await readIaConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = (await request.json()) as IaConfig;
  await writeIaConfig(body);

  revalidatePath('/');

  const updated = await readIaConfig();
  return NextResponse.json(updated);
}
