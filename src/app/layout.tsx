import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ConditionalFooter from '@/components/ConditionalFooter';
import { SchoolFilterProvider } from '@/components/SchoolFilterProvider';
import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Stade Formation - Formations sportives diplômantes',
  description:
    'Devenez éducateur sportif diplômé avec Stade Formation. BPJEPS, DEJEPS, Titre Pro - formations sportives de niveau 4 et 5 en France.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} data-theme="light" data-brand="both" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sf-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');var s=localStorage.getItem('sf-school-filter');document.documentElement.setAttribute('data-brand',s==='stade-formation'||s==='sporformation'?s:'both');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SchoolFilterProvider>
          {children}
          <ConditionalFooter />
        </SchoolFilterProvider>
      </body>
    </html>
  );
}
