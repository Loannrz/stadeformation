import { notFound } from 'next/navigation';
import { getFormationBySlug } from '@/lib/formations';
import FormationEditor from '../FormationEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminFormationPage({ params }: Props) {
  const { id } = await params;
  const formation = getFormationBySlug(id);
  if (!formation) notFound();

  return <FormationEditor formation={formation} />;
}
