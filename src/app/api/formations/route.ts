import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { Formation } from '@/lib/formations';
import { readFormationsFile, writeFormationsFile } from '@/lib/formation-trash';

export async function GET() {
  const formations = await readFormationsFile();
  return NextResponse.json(formations);
}

export async function POST(request: Request) {
  const body = await request.json() as Formation;
  const formations = await readFormationsFile();

  if (formations.find((f) => f.id === body.id)) {
    return NextResponse.json({ error: 'ID déjà existant' }, { status: 409 });
  }

  formations.push(body);
  await writeFormationsFile(formations);
  revalidatePath('/');
  revalidatePath('/formation/[slug]', 'page');
  return NextResponse.json(body, { status: 201 });
}
