import styles from './CertificationsSection.module.scss';

const CERTS = [
  {
    level: 'Niveau 4',
    name: 'BPJEPS',
    desc: 'Brevet Professionnel de la Jeunesse, de l\'Éducation Populaire et du Sport',
  },
  {
    level: 'Niveau 5',
    name: 'DEJEPS',
    desc: 'Diplôme d\'État de la Jeunesse, de l\'Éducation Populaire et du Sport',
  },
  {
    level: 'Niveau 4',
    name: 'Titre Pro',
    desc: 'Titre Professionnel Animateur Loisirs & Tourisme',
  },
  {
    level: 'Niveau 5',
    name: 'TFP CDSSA',
    desc: 'Titre à Finalité Professionnelle - Développement Structure Sportive',
  },
  {
    level: 'Complément',
    name: 'Certificat',
    desc: 'Certificat Complémentaire Directeur ACM',
  },
  {
    level: 'Préalable',
    name: 'TEP',
    desc: 'Tests d\'Exigences Préalables - Épreuves de sélection',
  },
];

export default function CertificationsSection() {
  return (
    <section className={styles.section} id="certifications">
      <p className={styles.label}>Certifications</p>
      <h2 className={styles.title}>Des diplômes reconnus par l'État</h2>

      <div className={styles.grid}>
        {CERTS.map((c) => (
          <div key={c.name} className={styles.badge}>
            <span className={styles.level}>{c.level}</span>
            <div className={styles.name}>{c.name}</div>
            <div className={styles.desc}>{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
