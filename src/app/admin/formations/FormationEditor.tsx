'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Formation, FormationBlock, BlockItem } from '@/lib/formations';
import styles from './FormationEditor.module.scss';

type EditableFormation = Omit<Formation, 'id'> & { id: string };

const PRESET_COLORS = [
  { label: 'Orange', value: '#FF6B00' },
  { label: 'Bleu', value: '#3B82F6' },
  { label: 'Vert', value: '#10B981' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Ambre', value: '#F59E0B' },
  { label: 'Rose', value: '#EC4899' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Indigo', value: '#6366F1' },
];

const BLOCK_TYPES: Array<{ value: FormationBlock['type']; label: string }> = [
  { value: 'list', label: 'Liste à puces' },
  { value: 'text', label: 'Texte libre' },
  { value: 'steps', label: 'Étapes numérotées' },
];

const REGION_OPTIONS = [
  'Nouvelle-Aquitaine',
  'Île-de-France',
  'Corse',
  'Normandie',
  'PACA',
  'Occitanie',
  'Bretagne',
  'Pays de la Loire',
  'Hauts-de-France',
  'Grand Est',
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function createBlock(type: FormationBlock['type']): FormationBlock {
  const titles: Record<FormationBlock['type'], string> = {
    list: 'Nouveau bloc',
    text: 'Texte libre',
    steps: 'Les étapes',
  };

  const block: FormationBlock = {
    id: uid(),
    type,
    title: titles[type],
    color: '#FF6B00',
    items: [],
  };

  if (type === 'text') {
    block.items = [{ id: uid(), value: '' }];
  }

  return block;
}

function emptyFormation(): EditableFormation {
  return {
    id: '',
    nom: '',
    certification: '',
    regions: [],
    dates_inscription: null,
    date_limite_inscription: null,
    date_debut: null,
    duree: '',
    rythme: '',
    prerequis: [],
    url_inscription: '',
    description: '',
    inscription_active: true,
    date_cloture_inscription: null,
    highlights: ['', '', '', ''],
    blocks: [],
  };
}

interface BlockEditorProps {
  block: FormationBlock;
  onChange: (block: FormationBlock) => void;
  onDelete: () => void;
}

function BlockEditor({ block, onChange, onDelete }: BlockEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  function updateField<K extends keyof FormationBlock>(key: K, value: FormationBlock[K]) {
    onChange({ ...block, [key]: value });
  }

  function changeType(newType: FormationBlock['type']) {
    if (newType === block.type) return;

    if (newType === 'text') {
      const merged =
        block.items.length > 0
          ? block.items.map((item) => item.value).filter(Boolean).join('\n\n')
          : '';
      onChange({
        ...block,
        type: newType,
        items: [{ id: block.items[0]?.id ?? uid(), value: merged }],
      });
      return;
    }

    if (block.type === 'text' && block.items.length === 1) {
      const value = block.items[0].value.trim();
      onChange({
        ...block,
        type: newType,
        items: value ? [{ id: uid(), value, label: newType === 'steps' ? '1' : undefined }] : [],
      });
      return;
    }

    updateField('type', newType);
  }

  function updateItem(idx: number, patch: Partial<BlockItem>) {
    const items = block.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    onChange({ ...block, items });
  }

  function addItem() {
    const item: BlockItem = { id: uid(), value: '' };
    if (block.type === 'steps') item.label = String(block.items.length + 1);
    onChange({ ...block, items: [...block.items, item] });
  }

  function removeItem(idx: number) {
    onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });
  }

  const rgb = block.color.startsWith('#')
    ? `${parseInt(block.color.slice(1, 3), 16)}, ${parseInt(block.color.slice(3, 5), 16)}, ${parseInt(block.color.slice(5, 7), 16)}`
    : '255, 107, 0';

  return (
    <div
      className={styles.block}
      style={{
        background: `linear-gradient(to right, rgba(${rgb}, 0.08) 0%, transparent 60%)`,
        borderLeft: `3px solid rgba(${rgb}, 0.6)`,
      }}
    >
      <div className={styles.blockHeader}>
        <button type="button" className={styles.blockCollapse} onClick={() => setCollapsed((v) => !v)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <input
          className={styles.blockTitleInput}
          value={block.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Titre du bloc"
        />
        <button type="button" className={styles.blockDelete} onClick={onDelete} aria-label="Supprimer le bloc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className={styles.blockBody}>
          <div className={styles.blockMeta}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Type</label>
              <select
                className={styles.select}
                value={block.type}
                onChange={(e) => changeType(e.target.value as FormationBlock['type'])}
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Couleur du dégradé</label>
              <div className={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.colorDot} ${block.color === c.value ? styles.colorDotActive : ''}`}
                    style={{ background: c.value }}
                    title={c.label}
                    onClick={() => updateField('color', c.value)}
                  />
                ))}
                <input
                  type="color"
                  className={styles.colorCustom}
                  value={block.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  title="Couleur personnalisée"
                />
              </div>
            </div>
          </div>

          <div className={styles.itemsList}>
            {block.items.map((item, idx) => (
              <div key={item.id} className={styles.itemRow}>
                {block.type === 'steps' && (
                  <input
                    className={`${styles.input} ${styles.inputSmall}`}
                    value={item.label ?? ''}
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                    placeholder="N°"
                    style={{ width: 40 }}
                  />
                )}

                {block.type === 'text' ? (
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    value={item.value}
                    onChange={(e) => updateItem(idx, { value: e.target.value })}
                    placeholder="Contenu du texte…"
                    rows={4}
                  />
                ) : (
                  <input
                    className={styles.input}
                    value={item.value}
                    onChange={(e) => updateItem(idx, { value: e.target.value })}
                    placeholder={block.type === 'steps' ? 'Titre de l\'étape' : 'Élément de la liste'}
                  />
                )}

                {block.type === 'steps' && (
                  <input
                    className={styles.input}
                    value={item.sub ?? ''}
                    onChange={(e) => updateItem(idx, { sub: e.target.value })}
                    placeholder="Description de l'étape"
                  />
                )}

                {!(block.type === 'text' && block.items.length <= 1) && (
                  <button type="button" className={styles.itemDelete} onClick={() => removeItem(idx)} aria-label="Supprimer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {block.type !== 'text' && (
              <button type="button" className={styles.addItemBtn} onClick={addItem}>
                + Ajouter un élément
              </button>
            )}

            {block.type === 'text' && block.items.length === 0 && (
              <button type="button" className={styles.addItemBtn} onClick={addItem}>
                + Ajouter le texte
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  formation: Formation | null;
}

export default function FormationEditor({ formation }: Props) {
  const router = useRouter();
  const [data, setData] = useState<EditableFormation>(
    formation ? { ...formation } : emptyFormation()
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRegion, setNewRegion] = useState('');
  const [newVille, setNewVille] = useState('');
  const [newPrereq, setNewPrereq] = useState('');
  const isNew = !formation;

  function set<K extends keyof EditableFormation>(key: K, value: EditableFormation[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function updateHighlight(idx: number, value: string) {
    const h = [...data.highlights];
    h[idx] = value;
    set('highlights', h);
  }

  function addRegion() {
    if (!newRegion) return;
    const entry = newVille.trim() ? `${newRegion} (${newVille.trim()})` : newRegion;
    set('regions', [...data.regions, entry]);
    setNewRegion('');
    setNewVille('');
  }

  function removeRegion(idx: number) {
    set('regions', data.regions.filter((_, i) => i !== idx));
  }

  function addPrereq() {
    if (!newPrereq.trim()) return;
    set('prerequis', [...data.prerequis, newPrereq.trim()]);
    setNewPrereq('');
  }

  function removePrereq(idx: number) {
    set('prerequis', data.prerequis.filter((_, i) => i !== idx));
  }

  function addBlock(type: FormationBlock['type'] = 'list') {
    set('blocks', [...data.blocks, createBlock(type)]);
  }

  const updateBlock = useCallback((idx: number, block: FormationBlock) => {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b, i) => (i === idx ? block : b)),
    }));
    setSaved(false);
  }, []);

  function removeBlock(idx: number) {
    set('blocks', data.blocks.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    const url = isNew ? '/api/formations' : `/api/formations/${formation!.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSaved(true);
      if (isNew) {
        router.push(`/admin/formations/${data.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } else {
      alert('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer "${data.nom}" définitivement ?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/formations/${formation!.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1 className={styles.toolbarTitle}>
            {isNew ? 'Nouvelle formation' : data.nom || 'Édition'}
          </h1>
          {!isNew && (
            <a
              href={`/formation/${formation!.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.toolbarPreview}
            >
              Voir la page →
            </a>
          )}
        </div>
        <div className={styles.toolbarActions}>
          {!isNew && (
            <button
              type="button"
              className={styles.btnDelete}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '…' : 'Supprimer'}
            </button>
          )}
          <button
            type="button"
            className={`${styles.btnSave} ${saved ? styles.btnSaved : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Identité ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Identité</h2>
          {isNew && (
            <div className={styles.field}>
              <label className={styles.label}>ID (slug URL)</label>
              <input
                className={styles.input}
                value={data.id}
                onChange={(e) => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                placeholder="bpjeps-nom-formation"
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Nom de la formation</label>
            <input
              className={styles.input}
              value={data.nom}
              onChange={(e) => set('nom', e.target.value)}
              placeholder="BPJEPS Activités Physiques pour Tous"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Certification</label>
            <input
              className={styles.input}
              value={data.certification}
              onChange={(e) => set('certification', e.target.value)}
              placeholder="BPJEPS - Niveau 4"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>URL inscription (stadeformation.fr)</label>
            <input
              className={styles.input}
              value={data.url_inscription}
              onChange={(e) => set('url_inscription', e.target.value)}
              placeholder="https://stadeformation.fr/formations/..."
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description (intro de la page)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={data.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </div>
          <div className={styles.fieldGrid4}>
            {data.highlights.map((h, i) => (
              <div key={i} className={styles.field}>
                <label className={styles.label}>Chip {i + 1}</label>
                <input
                  className={styles.input}
                  value={h}
                  onChange={(e) => updateHighlight(i, e.target.value)}
                  placeholder="Ex: 1 an"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Régions ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Régions & lieux</h2>
          <div className={styles.tagList}>
            {data.regions.map((r, i) => (
              <span key={i} className={styles.tag}>
                {r}
                <button type="button" className={styles.tagRemove} onClick={() => removeRegion(i)}>×</button>
              </span>
            ))}
          </div>
          <div className={styles.addRow}>
            <select
              className={styles.select}
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
            >
              <option value="">Sélectionner une région…</option>
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              className={styles.input}
              value={newVille}
              onChange={(e) => setNewVille(e.target.value)}
              placeholder="Villes (Bordeaux, Agen…)"
              onKeyDown={(e) => e.key === 'Enter' && addRegion()}
            />
            <button type="button" className={styles.addBtn} onClick={addRegion} disabled={!newRegion}>
              + Ajouter
            </button>
          </div>
          <p className={styles.hint}>
            Ajouter une région activera automatiquement son affichage sur la carte nationale.
          </p>
        </section>

        {/* ── Inscription ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inscription</h2>
          <div className={styles.toggleRow}>
            <label className={styles.toggleLabel}>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={data.inscription_active}
                  onChange={(e) => set('inscription_active', e.target.checked)}
                />
                <span className={styles.toggleSlider} />
              </span>
              Inscriptions ouvertes
            </label>
            <p className={styles.toggleHint}>
              {data.inscription_active
                ? 'Le bouton S\'inscrire est actif sur la page de la formation'
                : 'Le bouton est grisé et affiché comme « Inscriptions fermées »'}
            </p>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Date de début</label>
              <input
                className={styles.input}
                value={data.date_debut ?? ''}
                onChange={(e) => set('date_debut', e.target.value || null)}
                placeholder="11/09/2026"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Inscription avant (affiché)</label>
              <input
                className={styles.input}
                value={data.date_limite_inscription ?? ''}
                onChange={(e) => set('date_limite_inscription', e.target.value || null)}
                placeholder="11/08/2026"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Clôture auto (JJ/MM/AAAA)</label>
              <input
                className={styles.input}
                value={data.date_cloture_inscription ?? ''}
                onChange={(e) => set('date_cloture_inscription', e.target.value || null)}
                placeholder="11/08/2026"
              />
              <p className={styles.hint}>Si cette date est dépassée, le bouton est automatiquement grisé.</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Session (affiché sur la carte)</label>
              <input
                className={styles.input}
                value={data.dates_inscription ?? ''}
                onChange={(e) => set('dates_inscription', e.target.value || null)}
                placeholder="Sessions septembre 2026"
              />
            </div>
          </div>
        </section>

        {/* ── Infos pratiques ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Infos pratiques</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Durée</label>
              <input
                className={styles.input}
                value={data.duree}
                onChange={(e) => set('duree', e.target.value)}
                placeholder="1 an"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Rythme</label>
              <input
                className={styles.input}
                value={data.rythme}
                onChange={(e) => set('rythme', e.target.value)}
                placeholder="Alternance"
              />
            </div>
          </div>
        </section>

        {/* ── Conditions d'accès ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Conditions d&apos;accès</h2>
          <ul className={styles.prereqList}>
            {data.prerequis.map((p, i) => (
              <li key={i} className={styles.prereqItem}>
                <input
                  className={styles.input}
                  value={p}
                  onChange={(e) => {
                    const prereqs = [...data.prerequis];
                    prereqs[i] = e.target.value;
                    set('prerequis', prereqs);
                  }}
                />
                <button type="button" className={styles.itemDelete} onClick={() => removePrereq(i)}>×</button>
              </li>
            ))}
          </ul>
          <div className={styles.addRow}>
            <input
              className={styles.input}
              value={newPrereq}
              onChange={(e) => setNewPrereq(e.target.value)}
              placeholder="Nouveau prérequis…"
              onKeyDown={(e) => e.key === 'Enter' && addPrereq()}
            />
            <button type="button" className={styles.addBtn} onClick={addPrereq}>+ Ajouter</button>
          </div>
        </section>

        {/* ── Blocs de contenu ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Blocs de contenu</h2>
            <div className={styles.addBlockRow}>
              <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('list')}>
                + Liste à puces
              </button>
              <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('text')}>
                + Texte libre
              </button>
              <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('steps')}>
                + Étapes
              </button>
            </div>
          </div>
          <p className={styles.hint}>
            Chaque bloc a un dégradé coloré orienté gauche → droite (couleur à gauche, transparent à droite).
          </p>

          <div className={styles.blocksList}>
            {data.blocks.length === 0 ? (
              <p className={styles.emptyBlocks}>Aucun bloc. Utilisez les boutons ci-dessus pour commencer.</p>
            ) : (
              data.blocks.map((block, idx) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={(b) => updateBlock(idx, b)}
                  onDelete={() => removeBlock(idx)}
                />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
