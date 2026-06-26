'use client';

import { useState } from 'react';
import { ECOLE_LABELS, type Ecole } from '@/lib/brand';
import type {
  IaBranch,
  IaButton,
  IaConfig,
  IaNode,
  IaNodeMode,
} from '@/lib/ia-flow';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from './IaFlowEditor.module.scss';

interface Props {
  initialConfig: IaConfig;
}

type ConfirmState = { message: string; onConfirm: () => void } | null;

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyNode(): IaNode {
  return {
    id: createId(),
    title: 'Nouveau nœud',
    message: '',
    showContacts: null,
    link: null,
    mode: 'stop',
    buttons: [],
    branches: [],
    fallbackMessage: '',
  };
}

const CONTACT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Aucune' },
  { value: 'stade-formation', label: ECOLE_LABELS['stade-formation'] },
  { value: 'sporformation', label: ECOLE_LABELS['sporformation'] },
  { value: 'both', label: ECOLE_LABELS.both },
];

const MAX_KEYWORDS = 20;

interface KeywordsEditorProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}

function KeywordsEditor({
  keywords,
  onChange,
  placeholder = 'Ex: directeur',
}: KeywordsEditorProps) {
  const items = keywords.length > 0 ? keywords : [''];

  function update(idx: number, value: string) {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  }

  function add() {
    if (items.length >= MAX_KEYWORDS) return;
    onChange([...items, '']);
  }

  function remove(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : ['']);
  }

  return (
    <div className={styles.chipSection}>
      <div className={styles.chipGrid}>
        {items.map((kw, i) => (
          <div key={i} className={styles.chipField}>
            {items.length > 1 && (
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => remove(i)}
                aria-label={`Supprimer le mot-clé ${i + 1}`}
              >
                ×
              </button>
            )}
            <input
              className={styles.input}
              value={kw}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
        {items.length < MAX_KEYWORDS && (
          <button type="button" className={styles.chipAdd} onClick={add}>
            <span className={styles.chipAddIcon}>+</span>
            <span className={styles.chipAddLabel}>Ajouter un mot-clé</span>
          </button>
        )}
      </div>
    </div>
  );
}

function sanitizeKeywords(keywords: string[]): string[] {
  return keywords.map((k) => k.trim()).filter(Boolean);
}

function sanitizeConfig(config: IaConfig): IaConfig {
  return {
    ...config,
    triggers: config.triggers.map((t) => ({
      ...t,
      keywords: sanitizeKeywords(t.keywords),
    })),
    nodes: config.nodes.map((n) => ({
      ...n,
      branches: n.branches.map((b) => ({
        ...b,
        keywords: sanitizeKeywords(b.keywords),
      })),
    })),
  };
}

export default function IaFlowEditor({ initialConfig }: Props) {
  const [config, setConfig] = useState<IaConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  function requestConfirm(message: string, action: () => void) {
    setConfirm({
      message,
      onConfirm: () => {
        action();
        setConfirm(null);
      },
    });
  }

  function setField<K extends keyof IaConfig>(key: K, value: IaConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  // ── Déclencheurs (triggers racine) ──
  function addTrigger() {
    setConfig((c) => ({
      ...c,
      triggers: [...c.triggers, { id: createId(), keywords: [], targetNodeId: null }],
    }));
  }

  function updateTrigger(id: string, patch: Partial<IaBranch>) {
    setConfig((c) => ({
      ...c,
      triggers: c.triggers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }

  function removeTrigger(id: string) {
    setConfig((c) => ({ ...c, triggers: c.triggers.filter((t) => t.id !== id) }));
  }

  // ── Nœuds ──
  function addNode() {
    setConfig((c) => ({ ...c, nodes: [...c.nodes, emptyNode()] }));
  }

  function updateNode(id: string, patch: Partial<IaNode>) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }

  function removeNode(id: string) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.filter((n) => n.id !== id),
      triggers: c.triggers.map((t) =>
        t.targetNodeId === id ? { ...t, targetNodeId: null } : t,
      ),
    }));
  }

  // ── Boutons d'un nœud ──
  function addButton(nodeId: string) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              buttons: [...n.buttons, { id: createId(), label: '', targetNodeId: null }],
            }
          : n,
      ),
    }));
  }

  function updateButton(nodeId: string, buttonId: string, patch: Partial<IaButton>) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              buttons: n.buttons.map((b) => (b.id === buttonId ? { ...b, ...patch } : b)),
            }
          : n,
      ),
    }));
  }

  function removeButton(nodeId: string, buttonId: string) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId ? { ...n, buttons: n.buttons.filter((b) => b.id !== buttonId) } : n,
      ),
    }));
  }

  // ── Branches (saisie libre) d'un nœud ──
  function addBranch(nodeId: string) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              branches: [...n.branches, { id: createId(), keywords: [], targetNodeId: null }],
            }
          : n,
      ),
    }));
  }

  function updateBranch(nodeId: string, branchId: string, patch: Partial<IaBranch>) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              branches: n.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)),
            }
          : n,
      ),
    }));
  }

  function removeBranch(nodeId: string, branchId: string) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.map((n) =>
        n.id === nodeId ? { ...n, branches: n.branches.filter((b) => b.id !== branchId) } : n,
      ),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const payload = sanitizeConfig(config);
    try {
      const res = await fetch('/api/admin/ia-flow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur lors de l’enregistrement');
      }
      setConfig(await res.json());
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }

  function nodeOptions(currentNodeId?: string) {
    return config.nodes.filter((n) => n.id !== currentNodeId);
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <h1 className={styles.toolbarTitle}>Assistant IA — conversations</h1>
        <div className={styles.toolbarActions}>
          {savedAt && <span className={styles.savedHint}>Enregistré ✓</span>}
          {error && <span className={styles.errorHint}>{error}</span>}
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* ── Réglages généraux ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Réglages généraux</h2>
          <p className={styles.hint}>
            L’assistant personnalisé ajoute un bouton sous les régions dans la bulle de chat.
            Au clic, l’IA envoie un message puis attend une saisie libre comparée aux
            déclencheurs ci-dessous.
          </p>

          <div className={styles.toggleRow}>
            <span className={styles.label}>Activer l’assistant personnalisé</span>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${config.enabled ? styles.toggleBtnActive : ''}`}
                onClick={() => setField('enabled', true)}
              >
                Activé
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!config.enabled ? styles.toggleBtnActive : ''}`}
                onClick={() => setField('enabled', false)}
              >
                Désactivé
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Texte du bouton</label>
            <input
              className={styles.input}
              value={config.askButtonLabel}
              onChange={(e) => setField('askButtonLabel', e.target.value)}
              placeholder="Demander autre chose"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Message d’introduction</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={config.introMessage}
              onChange={(e) => setField('introMessage', e.target.value)}
              rows={2}
              placeholder="Bien sûr ! Dites-moi ce que vous recherchez."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Message si l’IA ne comprend pas (global)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={config.globalFallback}
              onChange={(e) => setField('globalFallback', e.target.value)}
              rows={2}
              placeholder="Désolé, je n'ai pas bien compris…"
            />
          </div>
        </section>

        {/* ── Déclencheurs ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Déclencheurs (entrée)</h2>
          <p className={styles.hint}>
            Quand le visiteur écrit après avoir cliqué sur le bouton, l’IA cherche un
            déclencheur dont un mot-clé apparaît dans le texte, puis ouvre le nœud associé.
          </p>

          {config.triggers.map((trigger, i) => (
            <div key={trigger.id} className={styles.ruleCard}>
              <div className={styles.ruleHead}>
                <span className={styles.ruleIndex}>Déclencheur {i + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    requestConfirm('Supprimer ce déclencheur ?', () => removeTrigger(trigger.id))
                  }
                  aria-label="Supprimer le déclencheur"
                >
                  ×
                </button>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mots-clés</label>
                <p className={styles.fieldHint}>Un mot ou une expression par champ.</p>
                <KeywordsEditor
                  keywords={trigger.keywords}
                  onChange={(keywords) => updateTrigger(trigger.id, { keywords })}
                  placeholder="Ex: contacter le directeur"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Aller vers le nœud</label>
                <select
                  className={styles.input}
                  value={trigger.targetNodeId ?? ''}
                  onChange={(e) =>
                    updateTrigger(trigger.id, { targetNodeId: e.target.value || null })
                  }
                >
                  <option value="">— Choisir un nœud —</option>
                  {nodeOptions().map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button type="button" className={styles.addBtn} onClick={addTrigger}>
            + Ajouter un déclencheur
          </button>
        </section>

        {/* ── Nœuds ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Nœuds de conversation</h2>
          <p className={styles.hint}>
            Chaque nœud envoie un message, puis propose des boutons, attend une saisie libre,
            ou termine la conversation.
          </p>

          {config.nodes.map((node, i) => (
            <div key={node.id} className={styles.nodeCard}>
              <div className={styles.nodeHead}>
                <span className={styles.nodeIndex}>Nœud {i + 1}</span>
                <input
                  className={`${styles.input} ${styles.nodeTitleInput}`}
                  value={node.title}
                  onChange={(e) => updateNode(node.id, { title: e.target.value })}
                  placeholder="Titre interne du nœud"
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    requestConfirm(
                      `Supprimer le nœud « ${node.title} » ?`,
                      () => removeNode(node.id),
                    )
                  }
                  aria-label="Supprimer le nœud"
                >
                  ×
                </button>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Message de l’IA</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={node.message}
                  onChange={(e) => updateNode(node.id, { message: e.target.value })}
                  rows={2}
                  placeholder="Ce que l'assistant répond à l'entrée de ce nœud…"
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Afficher des coordonnées</label>
                  <select
                    className={styles.input}
                    value={node.showContacts ?? ''}
                    onChange={(e) =>
                      updateNode(node.id, {
                        showContacts: (e.target.value || null) as Ecole | null,
                      })
                    }
                  >
                    {CONTACT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mode après le message</label>
                  <select
                    className={styles.input}
                    value={node.mode}
                    onChange={(e) => updateNode(node.id, { mode: e.target.value as IaNodeMode })}
                  >
                    <option value="buttons">Boutons</option>
                    <option value="freetext">Saisie libre</option>
                    <option value="stop">Fin de la conversation</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Lien optionnel (libellé + URL)</label>
                <div className={styles.linkRow}>
                  <input
                    className={styles.input}
                    value={node.link?.label ?? ''}
                    onChange={(e) =>
                      updateNode(node.id, {
                        link: e.target.value || node.link?.url
                          ? { label: e.target.value, url: node.link?.url ?? '' }
                          : null,
                      })
                    }
                    placeholder="Libellé (ex: Voir la formation)"
                  />
                  <input
                    className={styles.input}
                    value={node.link?.url ?? ''}
                    onChange={(e) =>
                      updateNode(node.id, {
                        link: e.target.value || node.link?.label
                          ? { label: node.link?.label ?? '', url: e.target.value }
                          : null,
                      })
                    }
                    placeholder="https://…"
                  />
                </div>
              </div>

              {node.mode === 'buttons' && (
                <div className={styles.subSection}>
                  <span className={styles.subLabel}>Boutons</span>
                  {node.buttons.map((btn) => (
                    <div key={btn.id} className={styles.inlineRow}>
                      <input
                        className={styles.input}
                        value={btn.label}
                        onChange={(e) => updateButton(node.id, btn.id, { label: e.target.value })}
                        placeholder="Texte du bouton"
                      />
                      <select
                        className={styles.input}
                        value={btn.targetNodeId ?? ''}
                        onChange={(e) =>
                          updateButton(node.id, btn.id, { targetNodeId: e.target.value || null })
                        }
                      >
                        <option value="">— Fin —</option>
                        {nodeOptions(node.id).map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={styles.removeBtnSmall}
                        onClick={() => removeButton(node.id, btn.id)}
                        aria-label="Supprimer le bouton"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addBtnSmall}
                    onClick={() => addButton(node.id)}
                  >
                    + Ajouter un bouton
                  </button>
                </div>
              )}

              {node.mode === 'freetext' && (
                <div className={styles.subSection}>
                  <span className={styles.subLabel}>Branches (mots-clés → nœud)</span>
                  {node.branches.map((branch) => (
                    <div key={branch.id} className={styles.branchCard}>
                      <KeywordsEditor
                        keywords={branch.keywords}
                        onChange={(keywords) =>
                          updateBranch(node.id, branch.id, { keywords })
                        }
                        placeholder="Ex: stade formation"
                      />
                      <div className={styles.branchTargetRow}>
                        <select
                          className={styles.input}
                          value={branch.targetNodeId ?? ''}
                          onChange={(e) =>
                            updateBranch(node.id, branch.id, {
                              targetNodeId: e.target.value || null,
                            })
                          }
                        >
                          <option value="">— Fin —</option>
                          {nodeOptions(node.id).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={styles.removeBtnSmall}
                          onClick={() => removeBranch(node.id, branch.id)}
                          aria-label="Supprimer la branche"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addBtnSmall}
                    onClick={() => addBranch(node.id)}
                  >
                    + Ajouter une branche
                  </button>
                  <div className={styles.field}>
                    <label className={styles.label}>Message d’erreur (aucune branche ne correspond)</label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      value={node.fallbackMessage}
                      onChange={(e) => updateNode(node.id, { fallbackMessage: e.target.value })}
                      rows={2}
                      placeholder="Je n'ai pas compris, pouvez-vous préciser ?"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <button type="button" className={styles.addBtn} onClick={addNode}>
            + Ajouter un nœud
          </button>
        </section>
      </div>

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
