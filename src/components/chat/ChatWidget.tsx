'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatFormation, ChatRegion } from '@/lib/chat-index';
import { getRegionsWithFormations, regionHasFormations } from '@/lib/chat-index';
import { getRegionFallbackSchool, matchFormations, matchKeywordNodeIds } from '@/lib/chat-match';
import type { IaButton, IaConfig } from '@/lib/ia-flow';
import {
  type ChatMessage,
  type Conversation,
  createConversation,
  createId,
  DESCRIBE_TEXT,
  formatRelativeDate,
  isConversationEmpty,
  loadConversations,
  NO_SCHOOL_IN_REGION_TEXT,
  saveConversations,
} from './chat-types';
import ContactCard from './ContactCard';
import FormationResultCard from './FormationResultCard';
import styles from './ChatWidget.module.scss';

interface Props {
  index: ChatFormation[];
  regions: ChatRegion[];
  iaConfig: IaConfig;
}

const MAX_RESULTS = 6;
const TYPE_DELAY_MS = 900;
const TYPE_SPEED_MS = 22;
const REGION_REVEAL_DELAY_MS = 1000;

const TEASER_PHRASES = [
  'Trouve ta formation !',
  'Je suis là pour t’aider',
  'Une question sur nos formations ?',
  'Quel métier du sport te fait rêver ?',
  'Besoin d’un coup de main ?',
  'Dis-moi ce que tu veux faire',
  'Trouve la formation faite pour toi',
  'Sport, animation, coaching… ?',
  'On cherche ensemble ?',
  'Clique, je te guide !',
  'Pas sûr de ton choix ? Parlons-en',
  'Quelle est ta région ?',
  'Envie de devenir éducateur sportif ?',
  'Et si on trouvait ta voie ?',
  'Je connais toutes nos formations',
  'Décris-moi ton projet',
  'Une idée de métier ? Viens !',
  'Ta formation t’attend',
  'Laisse-moi te conseiller',
  'Prêt à te lancer ?',
];

const TEASER_INITIAL_DELAY_MS = 2500;
const TEASER_TYPE_SPEED_MS = 45;
const TEASER_HOLD_MS = 4000;
const TEASER_GAP_MS = 7000;

function LauncherTeaser() {
  const [shown, setShown] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    let lastIndex = -1;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const typePhrase = (phrase: string) =>
      new Promise<void>((resolve) => {
        let i = 0;
        const tick = () => {
          if (cancelled) return resolve();
          i += 1;
          setShown(phrase.slice(0, i));
          if (i < phrase.length) {
            timers.push(window.setTimeout(tick, TEASER_TYPE_SPEED_MS));
          } else {
            resolve();
          }
        };
        tick();
      });

    const loop = async () => {
      await wait(TEASER_INITIAL_DELAY_MS);
      while (!cancelled) {
        let idx = Math.floor(Math.random() * TEASER_PHRASES.length);
        if (idx === lastIndex) idx = (idx + 1) % TEASER_PHRASES.length;
        lastIndex = idx;

        setShown('');
        setVisible(true);
        await typePhrase(TEASER_PHRASES[idx]);
        await wait(TEASER_HOLD_MS);
        if (cancelled) break;
        setVisible(false);
        await wait(TEASER_GAP_MS);
      }
    };

    void loop();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (!visible || !shown) return null;
  return <span className={styles.teaser}>{shown}</span>;
}

function truncate(text: string, max = 42): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function TypingDots() {
  return (
    <span className={styles.typingDots} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface TypewriterBubbleProps {
  text: string;
  onDone: () => void;
}

function TypewriterBubble({ text, onDone }: TypewriterBubbleProps) {
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let charTimer: number | undefined;
    let index = 0;

    const typeNext = () => {
      index += 1;
      setShown(text.slice(0, index));
      if (index < text.length) {
        charTimer = window.setTimeout(typeNext, TYPE_SPEED_MS);
      } else {
        onDone();
      }
    };

    const startTimer = window.setTimeout(() => {
      setTyping(true);
      typeNext();
    }, TYPE_DELAY_MS);

    return () => {
      window.clearTimeout(startTimer);
      if (charTimer) window.clearTimeout(charTimer);
    };
    // L'animation ne joue qu'une seule fois, au montage du message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`${styles.bubble} ${styles.bubbleBot}`}>
      {typing ? shown : <TypingDots />}
    </div>
  );
}

export default function ChatWidget({ index, regions, iaConfig }: Props) {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [regionDelayDone, setRegionDelayDone] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    const ids = new Set<string>();
    loaded.forEach((c) => c.messages.forEach((m) => ids.add(m.id)));
    setRevealed(ids);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const regionsWithFormations = useMemo(
    () => getRegionsWithFormations(index),
    [index],
  );

  const lastBotTextId = useMemo(() => {
    if (!active) return null;
    for (let i = active.messages.length - 1; i >= 0; i -= 1) {
      const m = active.messages[i];
      if (m.role === 'bot' && m.kind === 'text') return m.id;
    }
    return null;
  }, [active]);

  const greetingRevealed = lastBotTextId ? revealed.has(lastBotTextId) : false;
  const showRegionPicker =
    (active?.phase === 'region' || active?.phase === 'alt_region') &&
    greetingRevealed &&
    regionDelayDone;
  const pickerRegions =
    active?.phase === 'alt_region' ? regionsWithFormations : regions;

  const iaAvailable =
    iaConfig.enabled && iaConfig.triggers.length > 0 && iaConfig.nodes.length > 0;

  const iaNode = useMemo(() => {
    if (active?.phase !== 'ia' || !active.iaNodeId) return null;
    return iaConfig.nodes.find((n) => n.id === active.iaNodeId) ?? null;
  }, [active?.phase, active?.iaNodeId, iaConfig.nodes]);

  // En phase IA, on attend une saisie libre à la racine (déclencheurs)
  // ou sur un nœud en mode "saisie libre" (sauf si choix multiples en attente).
  const iaAwaitingText =
    active?.phase === 'ia' &&
    !active.iaEnded &&
    !(active.iaChoiceNodeIds && active.iaChoiceNodeIds.length > 0) &&
    (active.iaNodeId === null || iaNode?.mode === 'freetext');

  const showIaChoiceButtons =
    active?.phase === 'ia' &&
    !active.iaEnded &&
    Boolean(active.iaChoiceNodeIds?.length) &&
    greetingRevealed &&
    regionDelayDone;

  const showIaButtons =
    active?.phase === 'ia' &&
    !active.iaEnded &&
    iaNode?.mode === 'buttons' &&
    iaNode.buttons.length > 0 &&
    greetingRevealed &&
    regionDelayDone;

  // Affiche les boutons (région ou IA) 1 s après la fin de l'écriture du message.
  useEffect(() => {
    const waitsForButtons =
      active?.phase === 'region' ||
      active?.phase === 'alt_region' ||
      active?.phase === 'ia';
    if (waitsForButtons && greetingRevealed) {
      setRegionDelayDone(false);
      const timer = window.setTimeout(() => setRegionDelayDone(true), REGION_REVEAL_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
    setRegionDelayDone(false);
    return undefined;
  }, [active?.phase, greetingRevealed, lastBotTextId, activeId]);

  function markRevealed(id: string) {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!open) return;
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages, open, revealed, showRegionPicker, showIaButtons, showIaChoiceButtons]);

  function startFreshConversation() {
    const fresh = createConversation();
    setConversations((prev) => [fresh, ...prev.filter((c) => !isConversationEmpty(c))]);
    setActiveId(fresh.id);
    setInput('');
    setSidebarOpen(false);
  }

  function openWidget() {
    startFreshConversation();
    setOpen(true);
    setSidebarOpen(false);
  }

  function closeWidget() {
    setConversations((prev) => prev.filter((c) => !isConversationEmpty(c)));
    setOpen(false);
  }

  function updateActive(updater: (conversation: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)));
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setRevealed((prev) => {
        const next = new Set(prev);
        conv.messages.forEach((m) => next.add(m.id));
        return next;
      });
    }
  }

  function handleSelectRegion(region: ChatRegion) {
    if (!active) return;

    if (!regionHasFormations(region.id, index)) {
      updateActive((c) => ({
        ...c,
        regionId: region.id,
        regionName: region.name,
        phase: 'alt_region',
        title: region.name,
        messages: [
          ...c.messages,
          { id: createId(), role: 'user', kind: 'text', text: region.name },
          {
            id: createId(),
            role: 'bot',
            kind: 'text',
            text: NO_SCHOOL_IN_REGION_TEXT,
          },
        ],
      }));
      return;
    }

    updateActive((c) => ({
      ...c,
      regionId: region.id,
      regionName: region.name,
      phase: 'describe',
      title: region.name,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text: region.name },
        { id: createId(), role: 'bot', kind: 'text', text: DESCRIBE_TEXT },
      ],
    }));
  }

  function handleSelectAltRegion(region: ChatRegion) {
    if (!active) return;
    updateActive((c) => ({
      ...c,
      regionId: region.id,
      regionName: region.name,
      phase: 'describe',
      title: region.name,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text: region.name },
        { id: createId(), role: 'bot', kind: 'text', text: DESCRIBE_TEXT },
      ],
    }));
  }

  function handleNoRegionInterest() {
    if (!active) return;
    updateActive((c) => ({
      ...c,
      messages: [
        ...c.messages,
        {
          id: createId(),
          role: 'user',
          kind: 'text',
          text: "Aucune région ne m'intéresse",
        },
        {
          id: createId(),
          role: 'bot',
          kind: 'text',
          text: 'Pas de souci. Voici les coordonnées de nos deux écoles :',
        },
        {
          id: createId(),
          role: 'bot',
          kind: 'contact',
          contactSchool: null,
        },
      ],
    }));
  }

  function handleChangeRegion() {
    if (!active) return;
    updateActive((c) => ({
      ...c,
      phase: 'region',
      messages: [
        ...c.messages,
        {
          id: createId(),
          role: 'user',
          kind: 'text',
          text: 'Je veux changer de région',
        },
        {
          id: createId(),
          role: 'bot',
          kind: 'text',
          text: 'Pas de problème, choisissez une autre région :',
        },
      ],
    }));
  }

  function buildIaNodeMessages(nodeId: string): ChatMessage[] {
    const node = iaConfig.nodes.find((n) => n.id === nodeId);
    if (!node) return [];
    const out: ChatMessage[] = [];
    if (node.message.trim()) {
      out.push({ id: createId(), role: 'bot', kind: 'text', text: node.message });
    }
    if (node.showContacts) {
      out.push({
        id: createId(),
        role: 'bot',
        kind: 'contact',
        contactSchool: node.showContacts,
      });
    }
    if (node.link && node.link.url.trim()) {
      out.push({ id: createId(), role: 'bot', kind: 'link', link: node.link });
    }
    return out;
  }

  function enterIaNode(nodeId: string, userText?: string) {
    if (!active) return;
    const node = iaConfig.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const botMessages = buildIaNodeMessages(nodeId);
    updateActive((c) => ({
      ...c,
      phase: 'ia',
      iaNodeId: node.id,
      iaChoiceNodeIds: null,
      iaEnded: node.mode === 'stop',
      title: isConversationEmpty(c) && userText ? truncate(userText) : c.title,
      messages: [
        ...c.messages,
        ...(userText
          ? [{ id: createId(), role: 'user', kind: 'text', text: userText } as ChatMessage]
          : []),
        ...botMessages,
      ],
    }));
  }

  function enterIaNodeFromChoice(nodeId: string) {
    if (!active) return;
    const node = iaConfig.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const botMessages = buildIaNodeMessages(nodeId);
    updateActive((c) => ({
      ...c,
      phase: 'ia',
      iaNodeId: node.id,
      iaChoiceNodeIds: null,
      iaEnded: node.mode === 'stop',
      messages: [
        ...c.messages,
        {
          id: createId(),
          role: 'user',
          kind: 'text',
          text: node.title,
        },
        ...botMessages,
      ],
    }));
  }

  function handleAskOther() {
    if (!active) return;
    updateActive((c) => ({
      ...c,
      phase: 'ia',
      iaNodeId: null,
      iaChoiceNodeIds: null,
      iaEnded: false,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text: iaConfig.askButtonLabel },
        { id: createId(), role: 'bot', kind: 'text', text: iaConfig.introMessage },
      ],
    }));
  }

  function handleIaButton(button: IaButton) {
    if (!active) return;
    if (button.targetNodeId) {
      enterIaNode(button.targetNodeId, button.label);
      return;
    }
    // Bouton sans cible : on termine la conversation.
    updateActive((c) => ({
      ...c,
      iaEnded: true,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text: button.label },
      ],
    }));
  }

  function handleIaSend(text: string) {
    if (!active) return;
    const branches = active.iaNodeId ? iaNode?.branches ?? [] : iaConfig.triggers;
    const nodeIds = matchKeywordNodeIds(text, branches);

    if (nodeIds.length === 1) {
      enterIaNode(nodeIds[0], text);
      return;
    }

    if (nodeIds.length > 1) {
      updateActive((c) => ({
        ...c,
        iaChoiceNodeIds: nodeIds,
        title: isConversationEmpty(c) ? truncate(text) : c.title,
        messages: [
          ...c.messages,
          { id: createId(), role: 'user', kind: 'text', text },
          {
            id: createId(),
            role: 'bot',
            kind: 'text',
            text: 'Vous préférez quoi entre :',
          },
        ],
      }));
      return;
    }

    const fallback = active.iaNodeId
      ? iaNode?.fallbackMessage || iaConfig.globalFallback
      : iaConfig.globalFallback;

    updateActive((c) => ({
      ...c,
      title: isConversationEmpty(c) ? truncate(text) : c.title,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text },
        { id: createId(), role: 'bot', kind: 'text', text: fallback || iaConfig.globalFallback },
      ],
    }));
  }

  function handleBackToRegions() {
    if (!active) return;
    updateActive((c) => ({
      ...c,
      phase: 'region',
      iaNodeId: null,
      iaChoiceNodeIds: null,
      iaEnded: false,
      messages: [
        ...c.messages,
        {
          id: createId(),
          role: 'bot',
          kind: 'text',
          text: 'Pas de problème, choisissez votre région :',
        },
      ],
    }));
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !active) return;

    if (active.phase === 'ia' && iaAwaitingText) {
      handleIaSend(text);
      setInput('');
      return;
    }

    if (active.phase !== 'describe' || !active.regionId) return;
    const regionId = active.regionId;
    const regionName = active.regionName ?? '';

    const matches = matchFormations(text, regionId, index).slice(0, MAX_RESULTS);
    const botMessages: ChatMessage[] = [];

    if (matches.length > 0) {
      botMessages.push({
        id: createId(),
        role: 'bot',
        kind: 'text',
        text: `Voici les formations qui correspondent le mieux à votre projet en ${regionName} :`,
      });
      botMessages.push({
        id: createId(),
        role: 'bot',
        kind: 'results',
        results: matches.map((m) => ({
          id: m.formation.id,
          nom: m.formation.nom,
          certification: m.formation.certification,
          ecole: m.ecole,
        })),
      });
    } else {
      const school = getRegionFallbackSchool(regionId, index);
      const introText =
        school === null
          ? `Nous n'avons pas encore de formation dans ${regionName}. Vous pouvez toutefois nous contacter, nous étudierons votre projet avec plaisir :`
          : `Je n'ai pas trouvé de formation correspondant précisément à votre recherche en ${regionName}. N'hésitez pas à contacter directement l'équipe qui gère cette région :`;
      botMessages.push({ id: createId(), role: 'bot', kind: 'text', text: introText });
      botMessages.push({
        id: createId(),
        role: 'bot',
        kind: 'contact',
        contactSchool: school,
        contactRegionName: regionName,
      });
    }

    updateActive((c) => ({
      ...c,
      title: isConversationEmpty(c) ? truncate(text) : c.title,
      messages: [
        ...c.messages,
        { id: createId(), role: 'user', kind: 'text', text },
        ...botMessages,
      ],
    }));
    setInput('');
  }

  function handleNoneFits() {
    if (!active || !active.regionId) return;
    const regionName = active.regionName ?? '';
    const school = getRegionFallbackSchool(active.regionId, index);
    const introText =
      school === null
        ? `Pas de souci. Contactez-nous directement, nous étudierons votre projet pour ${regionName} :`
        : `Pas de souci. Voici les coordonnées de l'équipe qui gère ${regionName} :`;
    updateActive((c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: createId(), role: 'bot', kind: 'text', text: introText },
        {
          id: createId(),
          role: 'bot',
          kind: 'contact',
          contactSchool: school,
          contactRegionName: regionName,
        },
      ],
    }));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canType = !!active && (active.phase === 'describe' || Boolean(iaAwaitingText));

  return (
    <>
      {!open && (
        <button
          type="button"
          className={styles.launcher}
          onClick={openWidget}
          aria-label="Ouvrir l'assistant de formations"
        >
          <LauncherTeaser />
          <span className={styles.launcherCircle} aria-hidden="true">
            <svg className={styles.launcherTriangle} viewBox="0 0 24 24">
              <polygon points="12,3 21,20 3,20" />
            </svg>
          </span>
        </button>
      )}

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Assistant de formations">
          <div className={styles.header}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Afficher l'historique des discussions"
            >
              ☰
            </button>
            <div className={styles.headerTitle}>
              <span className={styles.headerName}>Assistant formations</span>
              <span className={styles.headerSub}>Stade Formation &amp; SporFormation</span>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={closeWidget}
              aria-label="Fermer l'assistant"
            >
              ×
            </button>
          </div>

          <div className={styles.body}>
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
              <button
                type="button"
                className={styles.newButton}
                onClick={startFreshConversation}
              >
                + Nouvelle discussion
              </button>
              <div className={styles.historyList}>
                {conversations.length === 0 && (
                  <p className={styles.historyEmpty}>Aucune discussion pour le moment.</p>
                )}
                {conversations.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={`${styles.historyItem} ${
                      c.id === activeId ? styles.historyItemActive : ''
                    }`}
                    onClick={() => selectConversation(c.id)}
                  >
                    <span className={styles.historyItemTitle}>{c.title}</span>
                    <span className={styles.historyItemDate}>
                      {formatRelativeDate(c.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {sidebarOpen && (
              <button
                type="button"
                className={styles.sidebarBackdrop}
                aria-label="Fermer l'historique"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className={styles.chat}>
              <div className={styles.messages} ref={messagesRef}>
                {active?.messages.map((message, idx, arr) => {
                  // Pour les résultats/contacts : attendre la fin de l'écriture
                  // du message d'intro qui les précède.
                  let introRevealed = true;
                  if (message.kind !== 'text') {
                    for (let i = idx - 1; i >= 0; i -= 1) {
                      const prev = arr[i];
                      if (prev.role === 'bot' && prev.kind === 'text') {
                        introRevealed = revealed.has(prev.id);
                        break;
                      }
                    }
                  }

                  if (message.kind !== 'text' && !introRevealed) return null;

                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageRow} ${
                        message.role === 'user' ? styles.messageRowUser : ''
                      }`}
                    >
                      {message.kind === 'text' &&
                        (message.role === 'user' || revealed.has(message.id) ? (
                          <div
                            className={`${styles.bubble} ${
                              message.role === 'user' ? styles.bubbleUser : styles.bubbleBot
                            }`}
                          >
                            {message.text}
                          </div>
                        ) : (
                          <TypewriterBubble
                            text={message.text ?? ''}
                            onDone={() => markRevealed(message.id)}
                          />
                        ))}

                      {message.kind === 'results' && (
                        <div className={styles.resultList}>
                          {message.results?.map((item) => (
                            <FormationResultCard
                              key={item.id}
                              item={item}
                              onNavigate={() => setOpen(false)}
                            />
                          ))}
                          <button
                            type="button"
                            className={styles.noneFitsButton}
                            onClick={handleNoneFits}
                          >
                            Rien ne vous chauffe ?
                          </button>
                        </div>
                      )}

                      {message.kind === 'contact' && (
                        <ContactCard school={message.contactSchool ?? null} />
                      )}

                      {message.kind === 'link' && message.link && (
                        <a
                          className={styles.linkButton}
                          href={message.link.url}
                          target={message.link.url.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (!message.link?.url.startsWith('http')) setOpen(false);
                          }}
                        >
                          {message.link.label || 'En savoir plus'}
                        </a>
                      )}
                    </div>
                  );
                })}

                {showRegionPicker && (
                  <div className={styles.regionButtons}>
                    {pickerRegions.map((region) => (
                      <button
                        type="button"
                        key={region.id}
                        className={styles.regionButton}
                        onClick={() =>
                          active?.phase === 'alt_region'
                            ? handleSelectAltRegion(region)
                            : handleSelectRegion(region)
                        }
                      >
                        {region.name}
                      </button>
                    ))}
                    {active?.phase === 'alt_region' && (
                      <button
                        type="button"
                        className={styles.regionButtonMuted}
                        onClick={handleNoRegionInterest}
                      >
                        Aucune région ne m&apos;intéresse
                      </button>
                    )}
                    {active?.phase === 'region' && iaAvailable && (
                      <button
                        type="button"
                        className={styles.askOtherButton}
                        onClick={handleAskOther}
                      >
                        {iaConfig.askButtonLabel}
                      </button>
                    )}
                  </div>
                )}

                {showIaButtons && iaNode && (
                  <div className={styles.regionButtons}>
                    {iaNode.buttons.map((button) => (
                      <button
                        type="button"
                        key={button.id}
                        className={styles.regionButton}
                        onClick={() => handleIaButton(button)}
                      >
                        {button.label || '…'}
                      </button>
                    ))}
                  </div>
                )}

                {showIaChoiceButtons && active?.iaChoiceNodeIds && (
                  <div className={styles.regionButtons}>
                    {active.iaChoiceNodeIds.map((nodeId) => {
                      const node = iaConfig.nodes.find((n) => n.id === nodeId);
                      return (
                        <button
                          type="button"
                          key={nodeId}
                          className={styles.regionButton}
                          onClick={() => enterIaNodeFromChoice(nodeId)}
                        >
                          {node?.title || '…'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.composer}>
                {active && active.phase === 'describe' && (
                  <button
                    type="button"
                    className={styles.changeRegion}
                    onClick={handleChangeRegion}
                  >
                    {active.regionName} · changer de région
                  </button>
                )}
                {active && active.phase === 'ia' && (
                  <button
                    type="button"
                    className={styles.changeRegion}
                    onClick={handleBackToRegions}
                  >
                    ← Revenir aux régions
                  </button>
                )}
                <div className={styles.composerRow}>
                  <textarea
                    className={styles.textarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={
                      active?.phase === 'ia'
                        ? canType
                          ? 'Écrivez votre message…'
                          : 'Choisissez une option ci-dessus'
                        : canType
                          ? 'Décrivez ce que vous aimeriez faire…'
                          : 'Choisissez d’abord votre région ci-dessus'
                    }
                    rows={1}
                    disabled={!canType}
                  />
                  <button
                    type="button"
                    className={styles.sendButton}
                    onClick={handleSend}
                    disabled={!canType || input.trim().length === 0}
                    aria-label="Envoyer"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
