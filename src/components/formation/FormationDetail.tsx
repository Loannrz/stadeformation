import Link from 'next/link';
import { Formation, FormationBlock, isInscriptionOpen } from '@/lib/formations';
import { SITE } from '@/lib/site';
import RegionMapCarousel from '@/components/RegionMapCarousel';
import styles from './FormationDetail.module.scss';

interface Props {
  formation: Formation;
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" />
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

function BlockRenderer({ block }: { block: FormationBlock }) {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const rgb = block.color.startsWith('#') ? hexToRgb(block.color) : '255, 107, 0';

  return (
    <section
      className={styles.block}
      style={{
        background: `linear-gradient(to right, rgba(${rgb}, 0.1) 0%, transparent 70%)`,
        borderLeft: `3px solid rgba(${rgb}, 0.7)`,
      }}
    >
      <h2 className={styles.sectionTitle} style={{ color: block.color }}>{block.title}</h2>

      {block.type === 'list' && (
        <ul className={styles.objectifList}>
          {block.items.map((item) => (
            <li key={item.id} className={styles.objectifItem}>
              <span className={styles.objectifIcon} style={{ color: block.color }}><IconCheck /></span>
              {item.value}
            </li>
          ))}
        </ul>
      )}

      {block.type === 'text' && (
        <p className={styles.prose}>{block.items[0]?.value}</p>
      )}

      {block.type === 'steps' && (
        <div className={styles.steps}>
          {block.items.map((item, i) => (
            <div key={item.id} className={styles.step}>
              <div className={styles.stepLine}>
                <span className={styles.stepNum} style={{ background: block.color }}>{item.label ?? String(i + 1)}</span>
                {i < block.items.length - 1 && <span className={styles.stepConnector} />}
              </div>
              <div className={styles.stepBody}>
                <h3>{item.value}</h3>
                {item.sub && <p>{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function FormationDetail({ formation }: Props) {
  const certShort = formation.certification.split('-')[0].trim();
  const isAlternance = formation.rythme.toLowerCase().includes('alternance');
  const open = isInscriptionOpen(formation);

  return (
    <div className={styles.page}>
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
            <p className={styles.intro}>{formation.description}</p>
            <div className={styles.highlights}>
              {formation.highlights.map((h) => (
                <span key={h} className={styles.highlight}>{h}</span>
              ))}
            </div>
          </div>
          <aside className={styles.heroAside}>
            <div className={styles.mapCard}>
              <RegionMapCarousel regions={formation.regions} formationId={formation.id} />
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
              <span className={styles.statValue}>{certShort}</span>
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

        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            {formation.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
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
                    Votre rémunération dépend de votre âge et de votre niveau.
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

              {(formation.dates_inscription || formation.date_debut) && (
                <section className={`${styles.sideBlock} ${styles.sideBlockHighlight}`}>
                  <div className={styles.sideBlockHead}>
                    <span className={`${styles.sideBlockIcon} ${styles.sideBlockIconAccent}`}>
                      <IconCalendar />
                    </span>
                    <h3 className={styles.sideBlockTitle}>Prochaine session</h3>
                  </div>
                  <p className={styles.sessionText}>
                    {formation.dates_inscription ?? `Début ${formation.date_debut}`}
                  </p>
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
                  <p className={styles.sideQualiopiDesc}>Formation reconnue par l&apos;État →</p>
                </div>
              </Link>

              <div className={styles.sideCta}>
                {open ? (
                  <a
                    href={formation.url_inscription}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaPrimary}
                  >
                    S&apos;inscrire →
                  </a>
                ) : (
                  <span className={styles.ctaDisabled}>
                    {!formation.inscription_active ? 'Inscriptions fermées' : 'Session complète'}
                  </span>
                )}
                <a href={`mailto:${SITE.email}`} className={styles.ctaSecondary}>
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
