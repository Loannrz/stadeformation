import nextDynamic from 'next/dynamic';
import { getPublicFormations } from '@/lib/formations';
import { getChatFormationIndex, getChatRegions } from '@/lib/chat-index';
import { getPublicIaConfig } from '@/lib/ia-flow';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import InscriptionSteps from '@/components/InscriptionSteps';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import MapSectionLoader from '@/components/MapSectionLoader';
import ChatWidget from '@/components/chat/ChatWidget';

const CarteRegions = nextDynamic(() => import('@/components/CarteRegions'), {
  loading: () => <MapSectionLoader />,
});

export const dynamic = 'force-dynamic';

export default async function Home() {
  const publicFormations = getPublicFormations();
  const chatIndex = getChatFormationIndex();
  const chatRegions = getChatRegions();
  const iaConfig = await getPublicIaConfig();

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
      <ChatWidget index={chatIndex} regions={chatRegions} iaConfig={iaConfig} />
    </>
  );
}
