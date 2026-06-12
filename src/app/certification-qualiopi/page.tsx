import type { Metadata } from 'next';
import QualiopiPage from '@/components/QualiopiPage';

export const metadata: Metadata = {
  title: 'Certification Qualiopi - Stade Formation',
  description:
    'Consultez le certificat Qualiopi de Stade Formation - actions de formation et de formation par apprentissage.',
};

export default function Page() {
  return <QualiopiPage />;
}
