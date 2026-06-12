import styles from './InscriptionSteps.module.scss';

const steps = [
  {
    num: '01',
    title: 'Choisir sa formation',
    desc: 'Parcourez la carte, sélectionnez votre région et ouvrez la fiche qui vous correspond.',
  },
  {
    num: '02',
    title: 'Vérifier les conditions',
    desc: 'Consultez les prérequis, les dates de session et le rythme (alternance ou initial).',
  },
  {
    num: '03',
    title: 'Déposer sa candidature',
    desc: 'Complétez le formulaire en ligne. Notre équipe vous recontacte pour la suite du dossier.',
  },
];

export default function InscriptionSteps() {
  return (
    <section className={styles.section} id="inscription">
      <div className={styles.inner}>
        <p className={styles.label}>Candidature</p>
        <h2 className={styles.title}>S&apos;inscrire en 3 étapes</h2>
        <p className={styles.intro}>
          Pas besoin d&apos;avoir tout le dossier prêt pour commencer. On vous guide
          à chaque étape, de la région jusqu&apos;à l&apos;entrée en formation.
        </p>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.num} className={styles.step}>
              <span className={styles.num}>{step.num}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
