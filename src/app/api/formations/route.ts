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

export async function GET() {
  const formations = await readFormations();
  return NextResponse.json(formations);
}

export async function POST(request: Request) {
  const body = await request.json() as Formation;
  const formations = await readFormations();

  if (formations.find((f) => f.id === body.id)) {
    return NextResponse.json({ error: 'ID déjà existant' }, { status: 409 });
  }

  formations.push(body);
  await saveFormations(formations);
  revalidatePath('/');
  revalidatePath('/formation/[slug]', 'page');
  return NextResponse.json(body, { status: 201 });
}
