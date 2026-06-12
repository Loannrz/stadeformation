import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './MentionsLegalesPage.module.scss';

const donneesCollectees = [
  'Nom',
  'Prénom',
  'E-mail',
  'Téléphone',
  'Adresse',
  'Date et lieu de naissance',
  'Personne en situation de Handicap',
  'Discipline sportive pratiquée',
  'Diplômes obtenus',
  'Situation avant l\u2019entrée en formation',
  'Expériences professionnelles',
];

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.inner}>
          <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <span>Mentions légales</span>
          </nav>

          <header className={styles.header}>
            <p className={styles.label}>Informations légales</p>
            <h1 className={styles.title}>Mentions légales</h1>
          </header>

          <article className={styles.content}>
            <section className={styles.block}>
              <p>
                Le site <a href="https://stadeformation.fr">http://stadeformation.fr</a> est la
                propriété de la SARL Stade Formation au Capital Social de 1500&nbsp;€. Stade Formation
                CFA (Centre de Formation d&apos;apprentis) et OF (Organisme de Formation)
                27 avenue Virecourt 33370 ARTIGUES-PRÈS-BORDEAUX — 09 88 08 53 78
              </p>
              <p>La directrice de la publication du présent site internet est Madame Alexia BODIN.</p>
              <p>
                Le site <a href="https://stadeformation.fr">http://stadeformation.fr</a> est hébergé
                par la société Gandi.net domiciliée au 63-65 boulevard Masséna 75013 PARIS,
                au Capital de 2&nbsp;300&nbsp;000&nbsp;€
              </p>
              <p>
                N° SIRET&nbsp;: 42309345900042<br />
                N° de TVA&nbsp;: FR81423093459
              </p>
              <p>
                L&apos;éditeur s&apos;engage à respecter l&apos;ensemble des lois concernant la mise
                en place et l&apos;activité d&apos;un site internet.
              </p>
            </section>

            <section className={styles.block}>
              <h2>Conditions Générales d&apos;Utilisation</h2>

              <h3>Données collectées</h3>
              <ul>
                {donneesCollectees.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3>1 — Acceptation</h3>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation du site{' '}
                <a href="https://stadeformation.fr">https://stadeformation.fr</a> déterminent les
                règles d&apos;accès au site et ses conditions d&apos;utilisation. L&apos;utilisateur
                reconnaît accepter lesdites Conditions sans réserve du seul fait de sa connexion au
                Site et s&apos;engage à les respecter.
              </p>

              <h3>2 — Contenu du site</h3>
              <p>
                On entend par Contenu du site&nbsp;: la structure générale du site, la charte
                graphique, l&apos;ensemble des contenus diffusés sur ce Site (images, articles,
                photos, logos, marques, vidéos, interview, sons, textes, bases de données,
                newsletters, résultats, classements, calendriers). Il est précisé en tant que de
                besoin que l&apos;espace «&nbsp;personnel&nbsp;» fait partie du Contenu du site.
              </p>
              <p>
                Ce Contenu est protégé par la législation en vigueur en France notamment en matière
                de propriété intellectuelle et notamment le droit d&apos;auteur, les droits voisins,
                le droit des marques, le droit à l&apos;image… et par la législation internationale.
              </p>
              <p>
                Toute représentation et/ou reproduction et/ou exploitation totale(s) ou partielle(s)
                de ce Site et de son Contenu, par quelques procédés que ce soient, à quelque titre
                que ce soit, sans l&apos;autorisation préalable et expresse de Stade Formation, est
                interdite et constituerait une contrefaçon sanctionnée notamment par les articles
                L335-2 et suivants du Code de la Propriété intellectuelle, et/ou un acte de
                concurrence déloyale et/ou un acte de parasitisme susceptible d&apos;engager la
                responsabilité des personnes qui s&apos;y sont livrées.
              </p>

              <h3>3 — Licence d&apos;utilisation du contenu du site</h3>
              <p>
                Du seul fait de sa connexion au Site, l&apos;utilisateur reconnaît accepter de Stade
                Formation une licence d&apos;usage du Contenu du site strictement limitée aux
                conditions impératives suivantes&nbsp;:
              </p>
              <ul>
                <li>La présente licence accordée à titre non exclusif n&apos;est pas transmissible.</li>
                <li>
                  Le droit d&apos;usage conféré à l&apos;utilisateur est personnel et privé&nbsp;:
                  c&apos;est-à-dire que toute reproduction de tout ou partie du Contenu du site sur
                  un quelconque support pour un usage collectif ou professionnel, même en interne dans
                  l&apos;entreprise, est prohibée. Il en est de même pour toute communication de ce
                  Contenu par voie électronique, même diffusé en intranet ou en extranet d&apos;entreprise.
                </li>
                <li>
                  Cet usage comprend seulement l&apos;autorisation de reproduire pour stockage aux
                  fins de représentation sur écran monoposte et de reproduction en un exemplaire,
                  pour copie de sauvegarde et tirage papier. Elle comprend également l&apos;autorisation
                  d&apos;envoyer par mail un article du site à un ami ainsi qu&apos;un partage sur les
                  réseaux sociaux.
                </li>
                <li>
                  Tout autre usage est soumis à l&apos;autorisation préalable et expresse de Stade
                  Formation. La violation de ces dispositions soumet le contrevenant et toutes
                  personnes responsables aux peines pénales et civiles prévues par la loi française.
                </li>
                <li>
                  L&apos;accès à certains services peut amener{' '}
                  <a href="https://stadeformation.fr">https://stadeformation.fr</a> à déposer un
                  cookie. Celui-ci ne contient pas d&apos;informations nominatives vous concernant,
                  et susceptibles d&apos;être exploitées par des tiers.
                </li>
              </ul>

              <h3>4 — Accès gratuit à l&apos;espace personnalisable</h3>
              <p>
                Mon espace perso est un espace faisant partie de l&apos;écosystème{' '}
                <a href="https://stadeformation.fr">https://stadeformation.fr</a>, et est réservé
                aux internautes.
              </p>

              <h4>4.1 — Dispositions générales</h4>
              <p>
                Toute personne qui souhaite s&apos;inscrire à Mon espace doit remplir un formulaire
                d&apos;inscription. Au moment de son inscription, l&apos;utilisateur s&apos;engage
                à&nbsp;: (a) fournir des renseignements exacts, précis, actuels et complets et
                (b) maintenir et mettre promptement à jour ces renseignements pour les garder exacts,
                précis, actuels et complets. En cas de violation des présentes Conditions Générales
                d&apos;Utilisation, Stade Formation se réserve le droit de suspendre ou de résilier
                le compte de l&apos;utilisateur concerné et/ou de lui refuser toute utilisation
                actuelle ou future de tout ou partie de Mon Espace. Par ailleurs, Stade Formation
                se réserve le droit de suspendre l&apos;utilisation de l&apos;espace Mon Espace à
                tout moment, notamment en cas d&apos;arrêt de l&apos;espace Mon Espace.
              </p>

              <h4>4.2 — Dispositions spécifiques aux mineurs</h4>
              <p>
                Toute utilisation de Mon Espace par une personne mineure est effectuée sous
                l&apos;entière responsabilité des titulaires de l&apos;autorité parentale sur les
                personnes concernées. Pour cette raison, les parents qui désirent permettre à leurs
                enfants d&apos;accéder à Mon Espace doivent les aider à créer tout compte approprié
                et surveiller leur accès à Mon Espace. Il appartient au tuteur légal de déterminer
                si l&apos;une quelconque des informations et tout contenu publié sur Mon Espace
                convient pour son enfant.
              </p>

              <h3>5 — Droit d&apos;accès et de rectification</h3>
              <p>Consulter la Politique de confidentialité.</p>

              <h3>6 — Cookies</h3>
              <p>
                Des cookies sont intégrés au site pour réaliser des statistiques de visite et
                permettre l&apos;analyse d&apos;erreur applicatives. Pour plus de renseignements,
                lire la politique de cookies.
              </p>

              <h3>7 — Liens hypertextes</h3>
              <p>
                Les liens hypertextes mis en place dans le cadre du présent Site Web en direction
                d&apos;autres sites présents sur le réseau Internet, ne sauraient engager la
                responsabilité de Stade Formation. Les utilisateurs du site ne peuvent mettre en place
                un lien hypertexte en direction de ce Site sans l&apos;autorisation préalable et
                expresse de Stade Formation. Pour insérer un lien hypertexte entre votre site et le
                Site, une demande doit être effectuée par mail en écrivant à{' '}
                <a href="mailto:contact@stadeformation.fr">contact@stadeformation.fr</a>
              </p>

              <h3>8 — Demande d&apos;autorisation de reproduction de tout ou partie du contenu du site</h3>
              <p>
                Pour toute reproduction totale ou partielle du Contenu (images, articles, photos,
                logos, marques, vidéos, interview, sons, textes, bases de données…) sur support
                électronique (Web, intranet, CD-ROM…) ou sur support papier, une demande doit être
                adressée par courrier ou e-mail à&nbsp;: STADE FORMATION, 27 avenue Virecourt,
                33370 Artigues-Près-Bordeaux — E-mail&nbsp;:{' '}
                <a href="mailto:contact@stadeformation.fr">contact@stadeformation.fr</a>
              </p>
              <p>
                Cette demande doit préciser le contexte, la durée souhaitée, la nature du site, la
                présentation envisagée… ainsi que l&apos;identité de la personne qui en fait la
                demande, de l&apos;association ou l&apos;entreprise qu&apos;elle représente,
                l&apos;adresse URL du site concerné, ainsi que ses coordonnées incluant son e-mail.
              </p>

              <h3>9 — Virus, piratage et autres infractions</h3>
              <p>
                L&apos;utilisateur du site s&apos;interdit d&apos;introduire sciemment sur ce dernier
                des virus, des chevaux de Troie, des bombes logiques ou tout autre élément de
                quelque nature que ce soit, code ou programme informatique conçus pour interrompre,
                corrompre, détruire, détourner, endommager ou limiter les fonctionnalités ou les
                performances du site. Stade Formation ne répondra d&apos;aucune perte ni d&apos;aucun
                dommage de quelque nature que ce soit causés par une attaque par saturation, par des
                virus ou par d&apos;autres éléments technologiquement nuisibles qui pourraient
                infecter le matériel informatique de l&apos;utilisateur, ses programmes
                d&apos;ordinateur, ses données ou autres éléments dus à l&apos;utilisation du site
                ou au téléchargement de tout document affiché sur celui-ci ou sur tout site web qui
                lui est relié.
              </p>

              <h3>10 — Responsabilité</h3>
              <p>
                Dans la mesure de ce que la loi permet et des engagements expressément pris par Stade
                Formation, sur le Site <a href="https://stadeformation.fr">https://stadeformation.fr</a>,
                ni Stade Formation ni aucun de ses organismes affiliés, ni ses dirigeants, employés
                ou autres représentants, ne peuvent être tenus responsables des dommages, ceci
                incluant notamment toute perte de données, de revenu, de chance ou de profit, ainsi
                que toute demande émanant de tiers résultant de ou en rapport avec l&apos;utilisation
                du site, l&apos;information, le contenu, les éléments ou produits présentés sur
                ledit site.
              </p>
            </section>

            <section className={styles.block}>
              <h2>Conditions Générales de Vente</h2>

              <h3>Tarifs</h3>
              <p>
                Les prix sont indiqués en euros TTC. Ils ne sont pas majorés de TVA, car Stade
                Formation n&apos;y est pas assujetti. (Exonération de TVA article 261-4-4°-a du CGI).
                Les prix indiqués ne comprennent pas la restauration, ni l&apos;hébergement. Le
                présent devis est valable 3 mois à compter de la date d&apos;émission de ce dernier,
                et sa signature vaut pour acceptation. Toute formation ou cycle commencé est dû en
                totalité, sauf accord contraire exprès de Stade Formation.
              </p>

              <h3>Certifications</h3>
              <p>Le tarif des certifications est précisé sur les devis édités.</p>

              <h3>Durée</h3>
              <p>La durée de la formation est précisée sur chaque devis.</p>

              <h3>Facturation</h3>
              <p>
                Stade Formation vous fera parvenir une facture à l&apos;issue de la formation, ou
                selon un calendrier qui sera précisé dans la convention de formation. Les factures
                sont payables sous trente jours calendaires à compter de la date d&apos;émission de
                la facture.
              </p>

              <h3>Annulation / report</h3>
              <p>
                <strong>Par l&apos;entreprise / le particulier&nbsp;:</strong> L&apos;entreprise /
                le particulier peut annuler ou reporter une action de formation sans frais, à
                condition que cette annulation ou ce report ne soit notifié par écrit à Stade
                Formation dans les quinze jours précédents le début de la formation. Au-delà de ce
                délai, les coûts pédagogiques et les frais de dossier seront facturés.
              </p>
              <p>
                <strong>Par Stade Formation&nbsp;:</strong> Stade Formation se réserve le droit
                d&apos;annuler ou de reporter une session de formation en cas de nombre
                d&apos;inscrits insuffisants (8 pour les BPJEPS, 8 pour la formation MATU). Cette
                annulation ou report sera clairement notifié à l&apos;entreprise / le particulier,
                ainsi que la possibilité de s&apos;inscrire sur une prochaine session, ou de se faire
                rembourser l&apos;acompte. Par ailleurs, Stade Formation se réserve le droit
                d&apos;annuler une session de formation en cas de forces majeures.
              </p>

              <h3>Résolution des litiges</h3>
              <p>
                Toute contestation ou tout différend non réglés à l&apos;amiable, seront soumis au
                tribunal compétent dans le ressort du siège social de l&apos;Organisme de formation.
              </p>
            </section>

            <div className={styles.actions}>
              <Link href="/" className={styles.btnSecondary}>
                Retour à l&apos;accueil
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
