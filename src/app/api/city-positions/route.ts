import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { CityPositionsMap } from '@/lib/city-positions';

const DATA_PATH = join(process.cwd(), 'src/data/city-positions.json');

export async function GET() {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw) as CityPositionsMap);
  } catch {
    return NextResponse.json({});
  }
}
