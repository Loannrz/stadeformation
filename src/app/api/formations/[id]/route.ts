import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { Formation } from '@/lib/formations';
import {
  moveFormationToTrash,
  readFormationsFile,
  writeFormationsFile,
} from '@/lib/formation-trash';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  const formations = await readFormationsFile();
  const formation = formations.find((f) => f.id === id);
  if (!formation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(formation);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await request.json() as Formation;
  const formations = await readFormationsFile();
  const idx = formations.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  formations[idx] = { ...formations[idx], ...body, id };
  await writeFormationsFile(formations);
  revalidatePath('/');
  revalidatePath(`/formation/${id}`);
  return NextResponse.json(formations[idx]);
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;
  const entry = await moveFormationToTrash(id);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/trash');
  revalidatePath(`/formation/${id}`);
  return NextResponse.json({ ok: true, deletedAt: entry.deletedAt });
}
