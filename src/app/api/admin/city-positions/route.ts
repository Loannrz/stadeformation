import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getAdminSessionToken } from '@/lib/admin-auth';
import {
  cityNameToStorageKey,
  type CityPosition,
  type CityPositionsMap,
} from '@/lib/city-positions';

const DATA_PATH = join(process.cwd(), 'src/data/city-positions.json');

async function readPositions(): Promise<CityPositionsMap> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as CityPositionsMap;
  } catch {
    return {};
  }
}

async function savePositions(positions: CityPositionsMap) {
  await writeFile(DATA_PATH, `${JSON.stringify(positions, null, 2)}\n`);
}

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
  const positions = await readPositions();
  return NextResponse.json(positions);
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = (await request.json()) as {
    city?: string;
    position?: CityPosition;
    positions?: CityPositionsMap;
  };

  const current = await readPositions();

  if (body.positions) {
    await savePositions(body.positions);
  } else if (body.city && body.position) {
    const key = cityNameToStorageKey(body.city);
    current[key] = body.position;
    await savePositions(current);
  } else {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  revalidatePath('/');
  revalidatePath('/formation/[slug]', 'page');
  revalidatePath('/admin/city-map');

  const updated = await readPositions();
  return NextResponse.json(updated);
}
