import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formations, getFormationBySlug, isFormationPubliclyVisible } from '@/lib/formations';
import { isAdminSession } from '@/lib/admin-auth';
import Navbar from '@/components/Navbar';
import FormationDetail from '@/components/formation/FormationDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return formations.filter((f) => f.visible).map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) return {};
  return {
    title: `${formation.nom} - Stade Formation`,
    description: formation.description,
    robots: formation.visible ? undefined : { index: false, follow: false },
  };
}

export default async function FormationPage({ params }: Props) {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) notFound();

  const admin = await isAdminSession();
  if (!isFormationPubliclyVisible(formation) && !admin) notFound();

  return (
    <>
      <Navbar formation={formation} />
      <FormationDetail formation={formation} adminPreview={admin && !formation.visible} />
    </>
  );
}
