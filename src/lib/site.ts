export interface SchoolContact {
  name: string;
  tagline: string;
  taglineBase: string;
  email: string;
  phone: string;
  phoneHref: string;
  mobile?: string;
  whatsappHref?: string;
  address: string;
  website: string;
  social: {
    linkedin: string;
    instagram: string;
    facebook: string;
  };
}

export const STADE_CONTACT: SchoolContact = {
  name: 'Stade Formation',
  taglineBase: 'Le CFA des métiers du sport',
  tagline: 'Le CFA des métiers du sport',
  email: 'contact@stadeformation.fr',
  phone: '09 88 08 53 78',
  phoneHref: 'tel:+33988085378',
  mobile: '07 63 44 65 58',
  whatsappHref: 'https://wa.me/33763446558',
  address: '27 avenue de Virecourt, 33370 Artigues-près-Bordeaux',
  website: 'https://stadeformation.fr',
  social: {
    linkedin: 'https://www.linkedin.com/company/stade-formation-le-cfa-des-m%C3%A9tiers-du-sport/',
    instagram: 'https://www.instagram.com/stadeformation/',
    facebook: 'https://www.facebook.com/stadeformation',
  },
};

export const SPOR_CONTACT: SchoolContact = {
  name: 'SporFormation',
  taglineBase: 'Formations sportives et animation',
  tagline: 'Formations sportives et animation en Corse, Île-de-France, Normandie et Provence-Alpes-Côte d\'Azur',
  email: 'raphaelsporformation@gmail.com',
  phone: '07 44 99 06 99',
  phoneHref: 'tel:+33744990699',
  address: '159/161 rue Armand Silvestre, 92400 Courbevoie',
  website: 'https://sporformation.fr',
  social: {
    linkedin: 'https://www.linkedin.com/company/spor-formation/',
    instagram: 'https://www.instagram.com/sporformation/',
    facebook: 'https://www.facebook.com/SporFormation',
  },
};

/** @deprecated Préférer STADE_CONTACT - conservé pour le footer */
export const SITE = {
  name: STADE_CONTACT.name,
  tagline: STADE_CONTACT.tagline,
  email: STADE_CONTACT.email,
  phone: STADE_CONTACT.phone,
  phoneHref: STADE_CONTACT.phoneHref,
  mobile: STADE_CONTACT.mobile!,
  whatsappHref: STADE_CONTACT.whatsappHref!,
  address: STADE_CONTACT.address,
  legalUrl: '/mentions-legales',
  social: STADE_CONTACT.social,
} as const;
