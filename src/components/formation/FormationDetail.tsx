import Link from 'next/link';
import { Formation } from '@/lib/formations';
import { FormationContent, getNiveauLabel } from '@/lib/formation-content';
import { SITE } from '@/lib/site';
import RegionMapCarousel from '@/components/RegionMapCarousel';
import styles from './FormationDetail.module.scss';

interface Props {
  formation: Formation;
  content: FormationContent;
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FormationDetail({ formation, content }: Props) {
  const certShort = formation.certification.split('—')[0].trim();
  const niveau = getNiveauLabel(formation.certification);
  const isAlternance = formation.rythme.toLowerCase().includes('alternance');

  return (
    <div className={`${styles.page} ${styles[`theme_${content.categorie}`]}`}>
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
          <a href="/">Accueil</a>
          <span>/</span>
          <a href="/#carte">Formations</a>
          <span>/</span>
          <span>{certShort}</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroMain}>
            <span className={styles.badge}>{certShort}</span>
            <h1 className={styles.title}>{formation.nom}</h1>
            <p className={styles.intro}>{content.intro}</p>

            <div className={styles.highlights}>
              {content.highlights.map((h) => (
                <span key={h} className={styles.highlight}>{h}</span>
              ))}
            </div>
          </div>

          <aside className={styles.heroAside}>
            <div className={styles.mapCard}>
              <RegionMapCarousel regions={formation.regions} />
            </div>
          </aside>
        </header>

        <section className={styles.statsBand} aria-label="Informations clés">
          <div className={styles.stat}>
            <span className={styles.statIcon}>⏱</span>
            <div>
              <span className={styles.statLabel}>Durée</span>
              <span className={styles.statValue}>{formation.duree}</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📋</span>
            <div>
              <span className={styles.statLabel}>Rythme</span>
              <span className={styles.statValue}>{formation.rythme}</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>🎓</span>
            <div>
              <span className={styles.statLabel}>Diplôme</span>
              <span className={styles.statValue}>{niveau}</span>
            </div>
          </div>
          {formation.date_debut && (
            <div className={`${styles.stat} ${styles.statAccent}`}>
              <span className={styles.statIcon}>🗓</span>
              <div>
                <span className={styles.statLabel}>Début</span>
                <span className={styles.statValue}>{formation.date_debut}</span>
              </div>
            </div>
          )}
          {formation.date_limite_inscription && (
            <div className={`${styles.stat} ${styles.statWarn}`}>
              <span className={styles.statIcon}>⚡</span>
              <div>
                <span className={styles.statLabel}>Inscription avant</span>
                <span className={styles.statValue}>{formation.date_limite_inscription}</span>
              </div>
            </div>
          )}
        </section>

        <section className={styles.timeline}>
          <h2 className={styles.sectionTitle}>Votre parcours</h2>
          <div className={styles.steps}>
            {content.etapes.map((etape, i) => (
              <div key={etape.num} className={styles.step}>
                <div className={styles.stepLine}>
                  <span className={styles.stepNum}>{etape.num}</span>
                  {i < content.etapes.length - 1 && <span className={styles.stepConnector} />}
                </div>
                <div className={styles.stepBody}>
                  <h3>{etape.titre}</h3>
                  <p>{etape.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            <section className={styles.block}>
              <h2 className={styles.sectionTitle}>Objectifs de la formation</h2>
              <ul className={styles.objectifList}>
                {content.objectifs.map((obj) => (
                  <li key={obj} className={styles.objectifItem}>
                    <span className={styles.objectifIcon}><IconCheck /></span>
                    {obj}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block}>
              <h2 className={styles.sectionTitle}>Organisation</h2>
              <p className={styles.prose}>{content.organisation}</p>
            </section>

            <section className={styles.block}>
              <h2 className={styles.sectionTitle}>Pédagogie & évaluation</h2>
              <p className={styles.prose}>{content.pedagogie}</p>
            </section>

            <section className={`${styles.block} ${styles.debouchesBlock}`}>
              <h2 className={styles.sectionTitle}>Débouchés & poursuites</h2>
              <p className={styles.prose}>{content.debouches}</p>
            </section>
          </div>

          <aside className={styles.sideCol}>
            <div className={styles.sidePanel}>
              <div className={styles.sidePanelHero}>
                <span className={styles.sidePanelHeroTag}>Candidature</span>
                <p className={styles.sidePanelHeroText}>Tout ce qu&apos;il te faut pour te lancer</p>
              </div>

              {isAlternance && (
                <section className={`${styles.sideBlock} ${styles.sideBlockHighlight}`}>
                  <div className={styles.sideBlockHead}>
                    <h3 className={styles.sideBlockTitle}>Alternance & financement</h3>
                  </div>
                  <p className={styles.alternanceText}>
                    Vous êtes salarié de votre employeur sur un contrat d&apos;apprentissage :
                    cours au centre, pratique en structure.
                  </p>
                  <p className={styles.alternanceText}>
                    Les frais de formation sont pris en charge par l&apos;OPCO de l&apos;employeur.
                    Votre rémunération dépend de votre âge et de votre niveau au moment de la signature.
                  </p>
                  <p className={styles.alternanceText}>
                    Notre équipe vous accompagne pour trouver une structure d&apos;accueil si besoin.
                  </p>
                </section>
              )}

              <section className={styles.sideBlock}>
                <div className={styles.sideBlockHead}>
                  <span className={styles.sideBlockIcon}><IconClipboard /></span>
                  <h3 className={styles.sideBlockTitle}>Conditions d&apos;accès</h3>
                </div>
                <ul className={styles.prereqList}>
                  {formation.prerequis.map((p) => (
                    <li key={p} className={styles.prereqItem}>
                      <span className={styles.prereqCheck}><IconCheck /></span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {formation.dates_inscription && (
                <section className={`${styles.sideBlock} ${styles.sideBlockHighlight}`}>
                  <div className={styles.sideBlockHead}>
                    <span className={`${styles.sideBlockIcon} ${styles.sideBlockIconAccent}`}>
                      <IconCalendar />
                    </span>
                    <h3 className={styles.sideBlockTitle}>Prochaine session</h3>
                  </div>
                  <p className={styles.sessionText}>{formation.dates_inscription}</p>
                  {formation.date_limite_inscription && (
                    <p className={styles.sessionDeadline}>
                      Inscription avant le <strong>{formation.date_limite_inscription}</strong>
                    </p>
                  )}
                </section>
              )}

              <Link href="/certification-qualiopi" className={styles.sideQualiopi}>
                <span className={styles.sideQualiopiIcon}><IconShield /></span>
                <div>
                  <p className={styles.sideQualiopiTitle}>Certifié Qualiopi</p>
                  <p className={styles.sideQualiopiDesc}>
                    Formation et apprentissage reconnus par l&apos;État. Voir le certificat →
                  </p>
                </div>
              </Link>

              <div className={styles.sideCta}>
                <a
                  href={formation.url_inscription}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaPrimary}
                >
                  S&apos;inscrire →
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className={styles.ctaSecondary}
                >
                  Nous contacter
                </a>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
