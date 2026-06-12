import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import type { Formation } from '@/lib/formations';

const DATA_PATH = join(process.cwd(), 'src/data/formations.json');

async function readFormations(): Promise<Formation[]> {
  const raw = await readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Formation[];
}

async function saveFormations(formations: Formation[]) {
  await writeFile(DATA_PATH, JSON.stringify(formations, null, 2));
}

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  const formations = await readFormations();
  const formation = formations.find((f) => f.id === id);
  if (!formation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(formation);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await request.json() as Formation;
  const formations = await readFormations();
  const idx = formations.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  formations[idx] = { ...formations[idx], ...body, id };
  await saveFormations(formations);
  revalidatePath('/');
  revalidatePath(`/formation/${id}`);
  return NextResponse.json(formations[idx]);
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;
  const formations = await readFormations();
  const idx = formations.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  formations.splice(idx, 1);
  await saveFormations(formations);
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
