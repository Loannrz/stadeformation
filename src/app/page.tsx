import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CarteRegions from '@/components/CarteRegions';
import AboutSection from '@/components/AboutSection';
import InscriptionSteps from '@/components/InscriptionSteps';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CarteRegions />
        <AboutSection />
        <InscriptionSteps />
        <FAQSection />
        <ContactSection />
      </main>
    </>
  );
}
