import dynamic from 'next/dynamic';
import { getPublicFormations } from '@/lib/formations';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import InscriptionSteps from '@/components/InscriptionSteps';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import MapSectionLoader from '@/components/MapSectionLoader';

const CarteRegions = dynamic(() => import('@/components/CarteRegions'), {
  loading: () => <MapSectionLoader />,
});

export default function Home() {
  const publicFormations = getPublicFormations();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CarteRegions formations={publicFormations} />
        <AboutSection />
        <InscriptionSteps />
        <FAQSection />
        <ContactSection />
      </main>
    </>
  );
}
