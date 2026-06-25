import dynamic from 'next/dynamic';
import { getPublicFormations } from '@/lib/formations';
import { getChatFormationIndex, getChatRegions } from '@/lib/chat-index';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import InscriptionSteps from '@/components/InscriptionSteps';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import MapSectionLoader from '@/components/MapSectionLoader';
import ChatWidget from '@/components/chat/ChatWidget';

const CarteRegions = dynamic(() => import('@/components/CarteRegions'), {
  loading: () => <MapSectionLoader />,
});

export default function Home() {
  const publicFormations = getPublicFormations();
  const chatIndex = getChatFormationIndex();
  const chatRegions = getChatRegions();

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
      <ChatWidget index={chatIndex} regions={chatRegions} />
    </>
  );
}
