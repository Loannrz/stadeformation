'use client';

import Link from 'next/link';
import { useSchoolFilter } from './SchoolFilterProvider';
import styles from './AboutSection.module.scss';

const stadeValues = [
  'Alternance en centre et sur le terrain',
  'Accompagnement de la candidature au diplôme',
  'Sites en Île-de-France, Nouvelle-Aquitaine, PACA, Normandie, Corse…',
];

const sporValues = [
  'Formations sportives en alternance',
  'Réseau national de sites de formation',
  'BPJEPS, DEJEPS et titres professionnels',
];

const diplomaGroups = [
  {
    level: 'Niveau 4',
    items: [
      { name: 'BPJEPS', desc: 'Éducateur sportif - activités physiques et sportives' },
      { name: 'Titre Pro', desc: 'Animateur loisirs & tourisme' },
      { name: 'Certificat', desc: 'Directeur d\'accueil collectif de mineurs' },
      { name: 'TEP', desc: 'Tests d\'exigences préalables' },
    ],
  },
  {
    level: 'Niveau 5',
    items: [
      { name: 'DEJEPS', desc: 'Coordination de projets socio-éducatifs' },
      { name: 'TFP CDSSA', desc: 'Développement d\'une structure sportive associative' },
    ],
  },
];

function DiplomasBlock({ className }: { className?: string }) {
  return (
    <div className={[styles.diplomas, className].filter(Boolean).join(' ')} id="certifications">
      <p className={styles.diplomasLabel}>Nos diplômes</p>
      <h3 className={styles.diplomasTitle}>Reconnus par l&apos;État</h3>

      {diplomaGroups.map((group) => (
        <div key={group.level} className={styles.levelGroup}>
          <span className={styles.levelTag}>{group.level}</span>
          <ul className={styles.diplomaList}>
            {group.items.map((d) => (
              <li key={d.name} className={styles.diplomaItem}>
                <span className={styles.diplomaName}>{d.name}</span>
                <span className={styles.diplomaDesc}>{d.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function AboutSection() {
  const { filter } = useSchoolFilter();
  const showStade = filter === 'stade-formation' || filter === 'both';
  const showSpor = filter === 'sporformation' || filter === 'both';

  if (filter === 'both') {
    return (
      <section className={styles.section} id="about">
        <div className={styles.inner}>
          <div className={styles.panelBoth}>
            <div className={styles.bothMain}>
              <p className={styles.bothEyebrow}>Nos écoles</p>

              <div className={styles.brandRow}>
                <span className={styles.brandSpor}>SporFormation</span>
                <span className={styles.brandStade}>Stade Formation</span>
              </div>

              <div className={styles.mergedHeadline}>
                <div className={styles.headlineRow}>
                  <span className={styles.headStade}>L&apos;école des métiers</span>
                  <span className={styles.headSpor}>Former les talents</span>
                </div>
                <div className={styles.headlineRow}>
                  <span className={styles.headStadeAccent}>du sport</span>
                  <span className={styles.headSporAccent}>de demain</span>
                </div>
              </div>

              <p className={styles.bothIntro}>
                Deux expertises complémentaires pour former les professionnels du sport
                avec des parcours diplômants reconnus par l&apos;État, partout en France.
              </p>

              <div className={styles.bothColumns}>
                <div className={styles.bothCol}>
                  <p className={styles.colIntro}>
                    Stade Formation prépare aux diplômes d&apos;État de l&apos;éducation sportive
                    en alternance, en centre et en structure employeuse.
                  </p>
                  <ul className={[styles.values, styles.valuesStade].join(' ')}>
                    {stadeValues.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.bothCol}>
                  <p className={styles.colIntro}>
                    SporFormation propose des parcours diplômants dans le secteur sportif,
                    avec un ancrage territorial fort sur tout le territoire.
                  </p>
                  <ul className={[styles.values, styles.valuesSpor].join(' ')}>
                    {sporValues.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link href="/certification-qualiopi" className={styles.qualiopiLink}>
                Certifié Qualiopi - voir le certificat →
              </Link>
            </div>

            <DiplomasBlock className={styles.diplomasAside} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.panel}>
          {showStade && (
            <div className={[styles.schoolBlock, styles.schoolStade].join(' ')}>
              <div className={styles.story}>
                <p className={styles.label}>Stade Formation</p>
                <h2 className={styles.title}>
                  L&apos;école des métiers<br />
                  <span>du sport</span>
                </h2>
                <p className={styles.intro}>
                  Stade Formation prépare aux diplômes d&apos;État de l&apos;éducation sportive
                  en alternance. Notre objectif : vous faire acquérir de vraies compétences
                  professionnelles, en centre et en structure employeuse.
                </p>

                <ul className={styles.values}>
                  {stadeValues.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <strong>14</strong>
                    <span>formations</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>5+</strong>
                    <span>régions</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>4 & 5</strong>
                    <span>RNCP</span>
                  </div>
                </div>

                <Link href="/certification-qualiopi" className={styles.qualiopiLink}>
                  Certifié Qualiopi - voir le certificat →
                </Link>
              </div>
            </div>
          )}

          {showSpor && (
            <div className={[styles.schoolBlock, styles.schoolSpor].join(' ')}>
              <div className={styles.story}>
                <p className={styles.label}>SporFormation</p>
                <h2 className={styles.title}>
                  Former les talents<br />
                  <span>de demain</span>
                </h2>
                <p className={styles.intro}>
                  SporFormation propose des parcours diplômants dans le secteur sportif,
                  avec un ancrage territorial fort et des formations accessibles sur tout le territoire.
                </p>

                <ul className={styles.values}>
                  {sporValues.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <strong>14+</strong>
                    <span>formations</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>France</strong>
                    <span>entière</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>4 & 5</strong>
                    <span>RNCP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DiplomasBlock />
        </div>
      </div>
    </section>
  );
}
