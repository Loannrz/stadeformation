import type { Metadata } from 'next';
import MentionsLegalesPage from '@/components/MentionsLegalesPage';

export const metadata: Metadata = {
  title: 'Mentions légales - Stade Formation',
  description:
    'Mentions légales, conditions générales d\u2019utilisation et conditions générales de vente de Stade Formation.',
};

export default function Page() {
  return <MentionsLegalesPage />;
}
