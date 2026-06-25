import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminApiAuthorized } from '@/lib/admin-api-auth';
import {
  permanentlyDeleteFromTrash,
  restoreFormationFromTrash,
} from '@/lib/formation-trash';

interface Context {
  params: Promise<{ id: string }>;
}

function revalidateFormationPaths(id: string) {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/trash');
  revalidatePath(`/formation/${id}`);
  revalidatePath(`/admin/formations/${id}`);
}

export async function POST(_req: Request, { params }: Context) {
  if (!(await isAdminApiAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formation = await restoreFormationFromTrash(id);
    if (!formation) {
      return NextResponse.json({ error: 'Formation introuvable dans la corbeille' }, { status: 404 });
    }
    revalidateFormationPaths(id);
    return NextResponse.json(formation);
  } catch (err) {
    if (err instanceof Error && err.message === 'ID_ALREADY_EXISTS') {
      return NextResponse.json(
        { error: 'Une formation avec cet identifiant existe déjà' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  if (!(await isAdminApiAuthorized())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const ok = await permanentlyDeleteFromTrash(id);
  if (!ok) {
    return NextResponse.json({ error: 'Formation introuvable dans la corbeille' }, { status: 404 });
  }

  revalidatePath('/admin/trash');
  return NextResponse.json({ ok: true });
}
