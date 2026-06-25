import { NextResponse } from 'next/server';
import { isAdminApiAuthorized } from '@/lib/admin-api-auth';
import { readTrashFile } from '@/lib/formation-trash';

export async function GET() {
  if (!(await isAdminApiAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const trash = await readTrashFile();
  return NextResponse.json(trash);
}
