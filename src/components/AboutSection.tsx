import Link from 'next/link';
import styles from './AboutSection.module.scss';

const values = [
  'Alternance en centre et sur le terrain',
  'Accompagnement de la candidature au diplôme',
  'Sites en Île-de-France, Nouvelle-Aquitaine, PACA, Normandie, Corse…',
];

const diplomaGroups = [
  {
    level: 'Niveau 4',
    items: [
      { name: 'BPJEPS', desc: 'Éducateur sportif — activités physiques et sportives' },
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

export default function AboutSection() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.story}>
            <p className={styles.label}>Qui sommes-nous</p>
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
              {values.map((v) => (
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
              Certifié Qualiopi — voir le certificat →
            </Link>
          </div>

          <div className={styles.diplomas} id="certifications">
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
        </div>
      </div>
    </section>
  );
}
