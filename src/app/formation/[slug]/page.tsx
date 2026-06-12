import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formations, getFormationBySlug } from '@/lib/formations';
import { getFormationContent } from '@/lib/formation-content';
import Navbar from '@/components/Navbar';
import FormationDetail from '@/components/formation/FormationDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return formations.map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) return {};
  const content = getFormationContent(formation);
  return {
    title: `${formation.nom} — Stade Formation`,
    description: content.intro,
  };
}

export default async function FormationPage({ params }: Props) {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) notFound();

  const content = getFormationContent(formation);

  return (
    <>
      <Navbar formation={formation} />
      <FormationDetail formation={formation} content={content} />
    </>
  );
}
