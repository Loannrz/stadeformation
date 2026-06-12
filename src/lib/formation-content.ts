import { Formation } from './formations';

export type FormationCategorie =
  | 'bpjeps'
  | 'dejeps'
  | 'management'
  | 'animateur'
  | 'tep'
  | 'certificat';

export interface FormationEtape {
  num: number;
  titre: string;
  desc: string;
}

export interface FormationContent {
  categorie: FormationCategorie;
  intro: string;
  objectifs: string[];
  organisation: string;
  pedagogie: string;
  debouches: string;
  highlights: string[];
  etapes: FormationEtape[];
}

const CATEGORIE_MAP: Record<string, FormationCategorie> = {
  'bpjeps-mapst': 'bpjeps',
  'bpjeps-mapst-siblu': 'bpjeps',
  'bpjeps-aquatique': 'bpjeps',
  'bpjeps-forme': 'bpjeps',
  'bpjeps-basket': 'bpjeps',
  'bpjeps-rugby': 'bpjeps',
  'bpjeps-animation-socio': 'bpjeps',
  'dejeps-animation': 'dejeps',
  'tfp-cdssa': 'management',
  'tp-animateur-siblu': 'animateur',
  'tp-animateur-jet-tours-fitness': 'animateur',
  'tp-animateur-jet-tours-polyvalence': 'animateur',
  'cert-directeur-acm': 'certificat',
  'tep-bpjeps-mapst': 'tep',
};

const ETAPES_ALTERNANCE: FormationEtape[] = [
  { num: 1, titre: 'Candidature', desc: 'Dossier en ligne + sélection sur dossier et entretien' },
  { num: 2, titre: 'Contrat', desc: 'Signature du contrat d\'apprentissage avec un employeur' },
  { num: 3, titre: 'Formation', desc: 'Cours en centre + pratique en structure employeuse' },
  { num: 4, titre: 'Diplôme', desc: 'Évaluation par blocs de compétences et certification' },
];

const ETAPES_TEP: FormationEtape[] = [
  { num: 1, titre: 'Inscription', desc: 'Réservation de votre session TEP en ligne' },
  { num: 2, titre: 'Épreuves', desc: 'Tests physiques et techniques de sélection' },
  { num: 3, titre: 'Résultats', desc: 'Validation des exigences préalables' },
  { num: 4, titre: 'BPJEPS', desc: 'Inscription à la formation diplômante MAPST' },
];

const DEFAULTS: Record<FormationCategorie, Omit<FormationContent, 'categorie'>> = {
  bpjeps: {
    intro: '',
    objectifs: [
      'Mettre en œuvre un projet d\'animation s\'inscrivant dans le projet de la structure',
      'Encadrer tous publics, dans tous types de lieux',
      'Concevoir une séance ou un cycle pédagogique adapté',
      'Conduire des actions de découverte et d\'initiation',
      'Assurer la sécurité des pratiquants et des lieux',
      'Participer au fonctionnement quotidien de la structure',
    ],
    organisation:
      'Formation en alternance : temps en organisme de formation complété par une mise en situation professionnelle en structure employeuse. Contrat d\'apprentissage, formation rémunérée et prise en charge par l\'OPCO.',
    pedagogie:
      'Pédagogie active et expérientielle : pratiques sur le terrain, études de cas, jeux de rôles et accompagnement individualisé. Évaluation organisée par blocs de compétences.',
    debouches:
      'Éducateur sportif en association, club, collectivité, structure de loisirs ou établissement scolaire. Poursuites possibles : DEJEPS, TFP CDSSA ou concours ETAPS.',
    highlights: ['Diplôme d\'État niveau 4', 'Alternance rémunérée', 'Qualiopi certifié', 'Multi-sites en France'],
    etapes: ETAPES_ALTERNANCE,
  },
  dejeps: {
    intro: '',
    objectifs: [
      'Coordonner et piloter des projets d\'animation socio-éducative',
      'Encadrer une équipe d\'animateurs et de professionnels',
      'Concevoir des dispositifs adaptés aux publics et territoires',
      'Évaluer et ajuster les actions menées',
      'Représenter la structure auprès des partenaires',
    ],
    organisation:
      'Formation de niveau 5 en alternance, environ 700 heures en organisme de formation. Parcours combinant théorie, études de cas et projets en structure professionnelle.',
    pedagogie:
      'Approche par projets, analyse de pratiques professionnelles et accompagnement individualisé. Évaluation continue et certification par blocs.',
    debouches:
      'Coordinateur de projets, responsable de secteur, directeur adjoint en structure socioculturelle, sportive ou de jeunesse.',
    highlights: ['Niveau 5 — Bac+2', 'Coordination de projets', '700h en centre', 'Île-de-France'],
    etapes: ETAPES_ALTERNANCE,
  },
  management: {
    intro: '',
    objectifs: [
      'Développer une structure sportive associative',
      'Élaborer et piloter des événements sportifs',
      'Maîtriser la gestion administrative et budgétaire',
      'Animer un réseau de partenaires et bénévoles',
      'Mettre en place une stratégie de développement',
    ],
    organisation:
      'Formation en alternance sur 12 mois avec plus de 60 % du temps en entreprise. Accompagnement sur des projets réels de développement associatif.',
    pedagogie:
      'Études de cas, projets tutorés en structure et modules de gestion appliquée. Évaluation par situations professionnelles.',
    debouches:
      'Chargé de développement, secrétaire général, directeur de club ou responsable de projet en association sportive.',
    highlights: ['Niveau 5 — TFP', 'Gestion associative', '60 % en entreprise', 'Multi-régions'],
    etapes: ETAPES_ALTERNANCE,
  },
  animateur: {
    intro: '',
    objectifs: [
      'Animer des activités de loisirs pour tous publics',
      'Concevoir et mener des programmes d\'animation variés',
      'Garantir la sécurité et le bien-être des vacanciers',
      'Travailler en équipe dans un environnement touristique',
      'Développer son aisance relationnelle et linguistique',
    ],
    organisation:
      'Formation en alternance en partenariat avec des acteurs du tourisme (SIBLU, Jet Tours…). Immersion professionnelle garantie dès le début du parcours.',
    pedagogie:
      'Formation pratique intensive, mises en situation réelles et modules spécialisés (fitness, polyvalence, animation enfants…).',
    debouches:
      'Animateur en village vacances, club hôtelier, camping ou structure touristique en France et à l\'international.',
    highlights: ['Partenariat tourisme', 'Alternance', 'Mobilité', 'Emploi garanti en structure'],
    etapes: ETAPES_ALTERNANCE,
  },
  tep: {
    intro: '',
    objectifs: [
      'Valider les exigences physiques et techniques du BPJEPS MAPST',
      'Démontrer son aptitude à suivre la formation',
      'Obtenir l\'autorisation d\'inscription au diplôme',
    ],
    organisation:
      'Épreuves organisées sur une journée en centre de formation. Deux sessions disponibles par an à Bordeaux.',
    pedagogie:
      'Tests standardisés conformes au référentiel BPJEPS MAPST. Briefing, épreuves et débriefing le jour même.',
    debouches:
      'Accès à la formation BPJEPS MAPST et à l\'ensemble des parcours éducateur sportif de Stade Formation.',
    highlights: ['Obligatoire avant BPJEPS', '1 journée', '2 sessions / an', 'Bordeaux'],
    etapes: ETAPES_TEP,
  },
  certificat: {
    intro: '',
    objectifs: [
      'Assurer la direction d\'un accueil collectif de mineurs',
      'Garantir la sécurité physique et affective des mineurs',
      'Encadrer et coordonner l\'équipe d\'animation',
      'Respecter le cadre réglementaire des ACM',
    ],
    organisation:
      '105 heures de formation théorique complétées par 18 jours de stage en situation réelle de direction d\'ACM.',
    pedagogie:
      'Alternance théorie / terrain, études de cas réglementaires et accompagnement de stage.',
    debouches:
      'Directeur ou directeur adjoint de centre de loisirs, colonie de vacances ou accueil de jeunes.',
    highlights: ['105h + 18j stage', 'Complément BAFA/BAFD', 'Formation courte', 'Bordeaux'],
    etapes: [
      { num: 1, titre: 'Prérequis', desc: 'BPJEPS/DEJEPS + expérience ACM validée' },
      { num: 2, titre: 'Formation', desc: '105 heures théoriques en centre' },
      { num: 3, titre: 'Stage', desc: '18 jours de direction en ACM' },
      { num: 4, titre: 'Certificat', desc: 'Validation du certificat complémentaire' },
    ],
  },
};

const OVERRIDES: Partial<Record<string, Partial<FormationContent>>> = {
  'bpjeps-mapst': {
    intro:
      'Le BPJEPS « Multi-Activités Physiques ou Sportives pour Tous » forme des éducateurs sportifs capables d\'animer des activités variées auprès de tous publics : sports collectifs, pleine nature, entretien corporel et jeux ludiques. Diplôme de niveau 4 reconnu par l\'État, inscrit au RNCP.',
    organisation:
      '12 mois en alternance — 553 heures en organisme de formation. Contrat d\'apprentissage 35h, alternance centre / structure employeuse. Ruban pédagogique : entretien corporel, sports collectifs, tir à l\'arc, course d\'orientation, pleine nature.',
    debouches:
      'Éducateur sportif en association, collectivité, structure de loisirs, club sportif ou établissement scolaire. Poursuite vers DEJEPS, TFP CDSSA ou concours ETAPS. Taux d\'obtention : 94 % (session 2024-2025).',
    highlights: ['553h en centre', 'Alternance 35h', 'RNCP niveau 4', '94 % de réussite'],
  },
  'bpjeps-mapst-siblu': {
    intro:
      'Devenez éducateur sportif diplômé tout en intégrant le réseau de villages vacances SIBLU. Une formation MAPST en alternance avec une mise en situation professionnelle garantie dans l\'univers du tourisme sportif.',
    highlights: ['Partenariat SIBLU', '13 mois', 'Emploi en village vacances', 'Alternance'],
  },
  'bpjeps-aquatique': {
    intro:
      'Spécialisez-vous dans l\'encadrement des activités aquatiques et de la natation. Ce BPJEPS prépare au métier de maître-nageur sauveteur et éducateur sportif en milieu aquatique, en partenariat SIBLU.',
    highlights: ['Milieu aquatique', 'BNSSA requis', 'Partenariat SIBLU', 'Niveau 4'],
  },
  'bpjeps-forme': {
    intro:
      'Formez-vous au métier de coach sportif et animateur en salle de forme. Fitness, musculation, bien-être : encadrez des activités de la forme en club ou en centre de remise en forme.',
    organisation: '1 an en alternance, rythme jeudis et vendredis. Formation pratique en salle de sport.',
    highlights: ['Fitness & musculation', 'Rythme jeudi-vendredi', 'Courbevoie', 'Niveau 4'],
  },
  'bpjeps-basket': {
    intro:
      'Devenez éducateur sportif spécialisé basket-ball. Encadrez et entraînez des équipes en club ou en association sur trois sites en Île-de-France : Cergy, Courbevoie et Nanterre.',
    highlights: ['Mention basket', '3 sites IDF', 'Entraînement club', 'Niveau 4'],
  },
  'bpjeps-rugby': {
    intro:
      'Spécialisez-vous dans l\'encadrement du rugby à XV. Formation complète pour devenir éducateur sportif en club, disponible à Courbevoie et Toulon.',
    highlights: ['Mention rugby XV', 'Courbevoie & Toulon', 'Encadrement club', 'Niveau 4'],
  },
  'bpjeps-animation-socio': {
    intro:
      'Animez des activités socio-éducatives et culturelles auprès de tous publics. Devenez animateur polyvalent en MJC, centre socioculturel ou collectivité territoriale.',
    highlights: ['Animation socio-culturelle', 'Tous publics', 'Courbevoie', 'Niveau 4'],
  },
  'dejeps-animation': {
    intro:
      'Passez au niveau supérieur : coordonnez des projets d\'animation socio-éducative à l\'échelle d\'une structure ou d\'un territoire. Formation DEJEPS niveau 5 à Cergy et Paris 7ème.',
    highlights: ['Niveau 5', 'Coordination', 'Cergy & Paris', '700h en centre'],
  },
  'tfp-cdssa': {
    intro:
      'Devenez le pilier d\'une structure sportive associative : développement, gestion, événementiel et administration. Le TFP CDSSA forme les futurs responsables de clubs et associations.',
    highlights: ['Management sportif', '60 % en entreprise', '3 régions', 'Niveau 5'],
  },
  'tp-animateur-siblu': {
    intro:
      'Intégrez les villages vacances SIBLU comme animateur loisirs tourisme diplômé. Formation courte et intensive en alternance avec emploi dans le réseau SIBLU.',
    highlights: ['6 mois', 'Villages SIBLU', 'Animation vacances', 'Mobilité'],
  },
  'tp-animateur-jet-tours-fitness': {
    intro:
      'Spécialisez-vous en animation fitness dans les clubs Jet Tours & Club Eldorador. Formation en alternance à Dax avec débouchés dans le tourisme international.',
    highlights: ['Fitness', 'Jet Tours', '9 mois', 'International'],
  },
  'tp-animateur-jet-tours-polyvalence': {
    intro:
      'Devenez animateur polyvalent loisirs tourisme : sport, culture et récréation dans les clubs du groupe Jet Tours & Club Eldorador.',
    highlights: ['Polyvalence', 'Jet Tours', '9 mois', 'Clubs vacances'],
  },
  'cert-directeur-acm': {
    intro:
      'Direction d\'accueils collectifs de mineurs : colonies, centres de loisirs, séjours jeunes. Certificat complémentaire accessible aux titulaires BPJEPS ou DEJEPS.',
    highlights: ['Direction ACM', '105h + stage', 'Réglementaire', 'Bordeaux'],
  },
  'tep-bpjeps-mapst': {
    intro:
      'Les Tests d\'Exigences Préalables (TEP) sont obligatoires avant toute inscription au BPJEPS MAPST. Validez votre niveau physique et technique lors d\'une journée d\'épreuves à Bordeaux.',
    highlights: ['Prérequis BPJEPS', '1 journée', 'Sept. & nov. 2026', 'Bordeaux'],
  },
};

export function getFormationContent(formation: Formation): FormationContent {
  const categorie = CATEGORIE_MAP[formation.id] ?? 'bpjeps';
  const defaults = DEFAULTS[categorie];
  const override = OVERRIDES[formation.id] ?? {};

  return {
    categorie,
    intro: override.intro ?? formation.description ?? defaults.intro,
    objectifs: override.objectifs ?? defaults.objectifs,
    organisation: override.organisation ?? defaults.organisation,
    pedagogie: override.pedagogie ?? defaults.pedagogie,
    debouches: override.debouches ?? defaults.debouches,
    highlights: override.highlights ?? defaults.highlights,
    etapes: override.etapes ?? defaults.etapes,
  };
}

export function getNiveauLabel(certification: string): string {
  if (certification.includes('Niveau 5') || certification.includes('DEJEPS') || certification.includes('TFP')) {
    return 'Niveau 5';
  }
  if (certification.includes('Niveau 4') || certification.includes('BPJEPS') || certification.includes('Titre Pro')) {
    return 'Niveau 4';
  }
  return 'Certification';
}
