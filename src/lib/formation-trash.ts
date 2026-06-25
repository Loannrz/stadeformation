import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Formation } from '@/lib/formations';

const FORMATIONS_PATH = join(process.cwd(), 'src/data/formations.json');
const TRASH_PATH = join(process.cwd(), 'src/data/deleted-formations.json');

export interface DeletedFormationEntry {
  formation: Formation;
  deletedAt: string;
}

export async function readFormationsFile(): Promise<Formation[]> {
  const raw = await readFile(FORMATIONS_PATH, 'utf-8');
  return JSON.parse(raw) as Formation[];
}

export async function writeFormationsFile(formations: Formation[]) {
  await writeFile(FORMATIONS_PATH, `${JSON.stringify(formations, null, 2)}\n`);
}

export async function readTrashFile(): Promise<DeletedFormationEntry[]> {
  try {
    const raw = await readFile(TRASH_PATH, 'utf-8');
    return JSON.parse(raw) as DeletedFormationEntry[];
  } catch {
    return [];
  }
}

export async function writeTrashFile(entries: DeletedFormationEntry[]) {
  await writeFile(TRASH_PATH, `${JSON.stringify(entries, null, 2)}\n`);
}

export async function moveFormationToTrash(id: string): Promise<DeletedFormationEntry | null> {
  const formations = await readFormationsFile();
  const idx = formations.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const [removed] = formations.splice(idx, 1);
  await writeFormationsFile(formations);

  const entry: DeletedFormationEntry = {
    formation: removed,
    deletedAt: new Date().toISOString(),
  };

  const trash = await readTrashFile();
  trash.unshift(entry);
  await writeTrashFile(trash);

  return entry;
}

export async function restoreFormationFromTrash(id: string): Promise<Formation | null> {
  const trash = await readTrashFile();
  const idx = trash.findIndex((e) => e.formation.id === id);
  if (idx === -1) return null;

  const formations = await readFormationsFile();
  if (formations.some((f) => f.id === id)) {
    throw new Error('ID_ALREADY_EXISTS');
  }

  const [entry] = trash.splice(idx, 1);
  formations.push(entry.formation);
  await writeFormationsFile(formations);
  await writeTrashFile(trash);

  return entry.formation;
}

export async function permanentlyDeleteFromTrash(id: string): Promise<boolean> {
  const trash = await readTrashFile();
  const next = trash.filter((e) => e.formation.id !== id);
  if (next.length === trash.length) return false;
  await writeTrashFile(next);
  return true;
}
