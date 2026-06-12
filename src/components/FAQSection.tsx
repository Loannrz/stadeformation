'use client';

import { useState } from 'react';
import styles from './FAQSection.module.scss';

const faqs = [
  {
    q: 'Faut-il déjà être très sportif pour intégrer une formation ?',
    a: 'Non. Ce qui compte, c\'est votre motivation et votre projet professionnel. Certaines spécialités demandent un niveau technique précis (natation, basket, rugby…), mais la plupart des parcours BPJEPS sont accessibles si vous êtes en forme et prêt à vous investir.',
  },
  {
    q: 'C\'est quoi l\'alternance, concrètement ?',
    a: 'Vous signez un contrat avec un employeur (club, structure, collectivité…) et vous alternez entre le centre de formation et le terrain. Vous êtes salarié, avec un salaire et des congés, tout en préparant votre diplôme.',
  },
  {
    q: 'Est-ce que je suis rémunéré pendant la formation ?',
    a: 'Oui, en alternance. Votre rémunération dépend de votre âge et de votre niveau d\'études au moment de la signature du contrat. Notre équipe peut vous aider à comprendre ce que cela représente selon votre situation.',
  },
  {
    q: 'À quoi servent les TEP ?',
    a: 'Les Tests d\'Exigences Préalables (TEP) vérifient que vous avez le niveau physique et technique minimum pour entrer en BPJEPS. Ils sont obligatoires pour certaines mentions. Si vous ne les avez pas encore, on vous indique les sessions disponibles.',
  },
  {
    q: 'Quel âge faut-il avoir ?',
    a: 'La plupart de nos formations sont ouvertes aux majeurs. L\'apprentissage est accessible à partir de 16 ans sous certaines conditions. Contactez-nous avec votre date de naissance et votre situation : on vous répondra clairement.',
  },
  {
    q: 'Quel niveau d\'études est demandé ?',
    a: 'Cela dépend du diplôme visé (niveau 4 ou 5). Un niveau équivalent au bac est souvent attendu pour le niveau 5. Pour le BPJEPS, le dossier et le projet comptent autant que le parcours scolaire. On étudie chaque candidature.',
  },
  {
    q: 'Comment se passe une candidature ?',
    a: 'Vous choisissez une formation, vous remplissez le formulaire en ligne, puis notre équipe vous recontacte pour compléter le dossier (employeur, pièces justificatives, calendrier). Vous n\'êtes pas seul dans la démarche.',
  },
  {
    q: 'La formation est-elle prise en charge ?',
    a: 'En apprentissage, les frais de formation sont financés par l\'OPCO de l\'employeur. Vous n\'avez en principe pas à payer les coûts pédagogiques. Pour les autres modalités, on vous oriente selon votre profil.',
  },
  {
    q: 'Puis-je choisir ma ville de formation ?',
    a: 'Oui, selon les sessions ouvertes. Utilisez la carte pour voir les régions couvertes. Certaines formations ne sont disponibles que sur un site précis ; la fiche formation le précise toujours.',
  },
  {
    q: 'Je n\'ai pas tous les prérequis : que faire ?',
    a: 'Contactez-nous avant d\'abandonner. Il existe parfois des parcours progressifs (TEP, sessions de rattrapage, autre mention). On préfère en discuter franchement avec vous plutôt que de vous laisser dans le doute.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        <p className={styles.label}>Questions fréquentes</p>
        <h2 className={styles.title}>Les réponses qu&apos;on nous pose le plus</h2>
        <p className={styles.intro}>
          Vous hésitez encore ? Voici ce que les candidats nous demandent
          avant de se lancer — sans jargon inutile.
        </p>

        <div className={styles.list}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.q} className={[styles.item, isOpen ? styles.itemOpen : ''].join(' ')}>
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className={styles.answer}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
