import type { Ecole } from '@/lib/brand';

export type ChatPhase = 'region' | 'alt_region' | 'describe';

export interface ChatResultItem {
  id: string;
  nom: string;
  certification: string;
  ecole: Ecole;
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  kind: 'text' | 'results' | 'contact';
  text?: string;
  results?: ChatResultItem[];
  /** Pour les messages de repli "contact" : école dominante (null = aucune formation). */
  contactSchool?: Ecole | null;
  contactRegionName?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  regionId: string | null;
  regionName: string | null;
  phase: ChatPhase;
  messages: ChatMessage[];
}

export const CHAT_STORAGE_KEY = 'sf-chat-conversations';

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const GREETING_TEXT =
  "Bonjour ! Vous cherchez une formation ? Je suis là pour vous aider. " +
  "Pour commencer, choisissez votre région.";

export const DESCRIBE_TEXT =
  "Parfait. Décrivez maintenant, le plus précisément possible, ce que vous aimeriez " +
  "faire (métier visé, activité, public, centre d'intérêt…). Je vous proposerai les " +
  "formations les plus adaptées.";

export const NO_SCHOOL_IN_REGION_TEXT =
  "Aucune école n'est disponible dans cette région. Souhaitez-vous faire vos études " +
  "ailleurs ? Quelle est votre région de prédilection ?";

export function createConversation(): Conversation {
  return {
    id: createId(),
    title: 'Nouvelle discussion',
    createdAt: Date.now(),
    regionId: null,
    regionName: null,
    phase: 'region',
    messages: [
      {
        id: createId(),
        role: 'bot',
        kind: 'text',
        text: GREETING_TEXT,
      },
    ],
  };
}

/** Une conversation est "vide" tant que le visiteur n'a envoyé aucun message. */
export function isConversationEmpty(conversation: Conversation): boolean {
  return !conversation.messages.some((m) => m.role === 'user');
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    /* quota / disabled storage : ignore */
  }
}

export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (sameDay) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
