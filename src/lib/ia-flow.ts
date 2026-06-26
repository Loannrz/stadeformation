import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Ecole } from '@/lib/brand';

/** Un bouton proposé après un message de nœud (mène vers un autre nœud, ou termine si null). */
export interface IaButton {
  id: string;
  label: string;
  targetNodeId: string | null;
}

/** Une branche de saisie libre : si un mot-clé correspond, on va vers le nœud cible. */
export interface IaBranch {
  id: string;
  keywords: string[];
  targetNodeId: string | null;
}

/** Lien optionnel affiché sous le message d'un nœud. */
export interface IaLink {
  label: string;
  url: string;
}

export type IaNodeMode = 'buttons' | 'freetext' | 'stop';

/** Un nœud de l'arbre de conversation. */
export interface IaNode {
  id: string;
  /** Libellé interne pour repérer le nœud en admin (non affiché aux visiteurs). */
  title: string;
  /** Message envoyé par l'IA à l'entrée du nœud. */
  message: string;
  /** Coordonnées d'école à afficher avec le message (null = aucune). */
  showContacts: Ecole | null;
  /** Bouton lien optionnel (formation ou URL externe). */
  link: IaLink | null;
  mode: IaNodeMode;
  /** Utilisé quand mode === 'buttons'. */
  buttons: IaButton[];
  /** Utilisé quand mode === 'freetext'. */
  branches: IaBranch[];
  /** Message affiché quand aucune branche ne correspond (mode 'freetext'). */
  fallbackMessage: string;
}

export interface IaConfig {
  enabled: boolean;
  /** Texte du bouton affiché sous les régions dans la bulle. */
  askButtonLabel: string;
  /** Message envoyé par l'IA après le clic sur le bouton. */
  introMessage: string;
  /** Message envoyé quand aucun déclencheur racine ne correspond. */
  globalFallback: string;
  /** Déclencheurs racine : mots-clés -> nœud d'entrée. */
  triggers: IaBranch[];
  nodes: IaNode[];
}

const DATA_PATH = join(process.cwd(), 'src/data/ia-flow.json');

export const DEFAULT_IA_CONFIG: IaConfig = {
  enabled: false,
  askButtonLabel: 'Demander autre chose',
  introMessage: 'Bien sûr ! Dites-moi ce que vous recherchez.',
  globalFallback:
    "Désolé, je n'ai pas bien compris votre demande. Pouvez-vous reformuler ?",
  triggers: [],
  nodes: [],
};

function normalizeConfig(raw: Partial<IaConfig> | null | undefined): IaConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_IA_CONFIG };
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : false,
    askButtonLabel: raw.askButtonLabel || DEFAULT_IA_CONFIG.askButtonLabel,
    introMessage: raw.introMessage || DEFAULT_IA_CONFIG.introMessage,
    globalFallback: raw.globalFallback || DEFAULT_IA_CONFIG.globalFallback,
    triggers: Array.isArray(raw.triggers) ? raw.triggers : [],
    nodes: Array.isArray(raw.nodes) ? raw.nodes : [],
  };
}

export async function readIaConfig(): Promise<IaConfig> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return normalizeConfig(JSON.parse(raw) as Partial<IaConfig>);
  } catch {
    return { ...DEFAULT_IA_CONFIG };
  }
}

export async function writeIaConfig(config: IaConfig): Promise<void> {
  const normalized = normalizeConfig(config);
  await writeFile(DATA_PATH, `${JSON.stringify(normalized, null, 2)}\n`);
}

/** Config exposée au widget public (aucune donnée sensible : on renvoie tel quel). */
export async function getPublicIaConfig(): Promise<IaConfig> {
  return readIaConfig();
}
