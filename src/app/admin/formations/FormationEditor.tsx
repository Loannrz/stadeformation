'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CityPlacementModal from '@/components/admin/CityPlacementModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { Formation, FormationBlock, BlockItem, FormationRegion, FormationCity } from '@/lib/formations';
import { normalizeFormation, getKnownCityNamesForRegion } from '@/lib/formations';
import { hasCityPosition } from '@/lib/city-positions';
import type { Ecole } from '@/lib/brand';
import { ECOLE_LABELS } from '@/lib/brand';
import styles from './FormationEditor.module.scss';

type EditableFormation = Omit<Formation, 'id'> & { id: string };

const ECOLE_OPTIONS: Ecole[] = ['stade-formation', 'sporformation', 'both'];

function EcoleSelect({
  value,
  defaultEcole,
  onChange,
  className,
}: {
  value?: Ecole;
  defaultEcole: Ecole;
  onChange: (ecole: Ecole) => void;
  className?: string;
}) {
  return (
    <select
      className={className ?? styles.select}
      value={value ?? defaultEcole}
      onChange={(e) => onChange(e.target.value as Ecole)}
    >
      {ECOLE_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>{ECOLE_LABELS[opt]}</option>
      ))}
    </select>
  );
}

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

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFormationId(nom: string, certification: string): string {
  const parts = [slugify(nom), slugify(certification)].filter(Boolean);
  return parts.join('-').replace(/-+/g, '-');
}

function validateFormation(data: EditableFormation, isNew: boolean): string[] {
  const errors: string[] = [];

  if (isNew && !data.id.trim()) {
    errors.push('L\'identifiant URL n\'a pas pu être généré : renseignez le nom et la certification.');
  }
  if (!data.nom.trim()) {
    errors.push('Le nom de la formation est obligatoire.');
  }
  if (!data.certification.trim()) {
    errors.push('La certification est obligatoire.');
  }
  if (!data.url_inscription.trim()) {
    errors.push('L\'URL d\'inscription est obligatoire.');
  }
  if (!data.description.trim()) {
    errors.push('La description (intro de la page) est obligatoire.');
  }

  if (data.regions.length === 0) {
    errors.push('Ajoutez au moins une région.');
  } else {
    const regionsSansVille = data.regions.filter((r) => r.cities.length === 0);
    if (regionsSansVille.length > 0) {
      errors.push(
        `Chaque région doit avoir au moins une ville (${regionsSansVille.map((r) => r.regionName).join(', ')} sans ville).`,
      );
    }
  }

  if (!data.date_debut?.trim()) {
    errors.push('La date de début est obligatoire (section Inscription).');
  }
  if (!data.date_limite_inscription?.trim()) {
    errors.push('La date « Inscription avant » est obligatoire (section Inscription).');
  }
  if (!data.date_cloture_inscription?.trim()) {
    errors.push('La date de clôture auto est obligatoire (section Inscription).');
  }
  if (!data.dates_inscription?.trim()) {
    errors.push('La session affichée sur la carte est obligatoire (section Inscription).');
  }

  if (!data.duree.trim()) {
    errors.push('La durée est obligatoire (section Infos pratiques).');
  }
  if (!data.rythme.trim()) {
    errors.push('Le rythme est obligatoire (section Infos pratiques).');
  }

  if (data.prerequis.filter((p) => p.trim()).length === 0) {
    errors.push('Ajoutez au moins une condition d\'accès.');
  }

  if (data.blocks.length === 0) {
    errors.push('Ajoutez au moins un bloc de contenu.');
  }

  return errors;
}

function getCityInputToken(value: string): string {
  const parts = value.split(',');
  return parts[parts.length - 1].trim();
}

function applyCitySelection(value: string, city: string): string {
  const parts = value.split(',');
  if (parts.length > 1) {
    const prefix = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);
    return [...prefix, city.trim()].join(', ');
  }
  return city.trim();
}

function CityAutocomplete({
  regionName,
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
}: {
  regionName: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const known = regionName ? getKnownCityNamesForRegion(regionName) : [];
  const token = getCityInputToken(value);
  const q = token.toLowerCase();
  const suggestions =
    q.length >= 1 ? known.filter((c) => c.toLowerCase().includes(q)) : [];

  function selectCity(city: string) {
    if (!city.trim()) return;
    if (onSubmit) {
      onSubmit(city.trim());
      onChange('');
    } else {
      onChange(applyCitySelection(value, city));
    }
    setOpen(false);
  }

  return (
    <div className={styles.cityAutocomplete}>
      <input
        className={className ?? styles.input}
        value={value}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(e.target.value.trim().length > 0);
        }}
        onFocus={() => {
          if (token.length >= 1) setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            selectCity(value);
          }
        }}
      />
      {open && regionName && token.length >= 1 && suggestions.length > 0 && (
        <ul className={styles.citySuggestions}>
          {suggestions.slice(0, 10).map((city) => (
            <li key={city}>
              <button
                type="button"
                className={styles.citySuggestionBtn}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectCity(city);
                }}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddCityInput({
  regionName,
  onAdd,
}: {
  regionName: string;
  onAdd: (name: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <CityAutocomplete
      regionName={regionName}
      value={value}
      onChange={setValue}
      onSubmit={onAdd}
      placeholder="Ajouter une ville…"
    />
  );
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

function formationSnapshot(f: EditableFormation): string {
  return JSON.stringify(f);
}

function toEditableFormation(formation: Formation | null): EditableFormation {
  return formation
    ? (normalizeFormation(formation as unknown as Record<string, unknown>) as EditableFormation)
    : emptyFormation();
}

function emptyFormation(): EditableFormation {
  return {
    id: '',
    nom: '',
    certification: '',
    ecole: 'stade-formation',
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
    highlights: [],
    blocks: [],
    visible: false,
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
  const [data, setData] = useState<EditableFormation>(() => toEditableFormation(formation));
  const [baseline, setBaseline] = useState(() => formationSnapshot(toEditableFormation(formation)));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState('');
  const [newRegionEcole, setNewRegionEcole] = useState<Ecole>('stade-formation');
  const [newVille, setNewVille] = useState('');
  const [newPrereq, setNewPrereq] = useState('');
  const [placementQueue, setPlacementQueue] = useState<{ regionName: string; city: string }[]>([]);
  const [visPulse, setVisPulse] = useState<'visible' | 'hidden' | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const isNew = !formation;
  const isDirty = formationSnapshot(data) !== baseline;

  useEffect(() => {
    const next = toEditableFormation(formation);
    setData(next);
    setBaseline(formationSnapshot(next));
    setValidationErrors([]);
  }, [formation?.id]);

  useEffect(() => {
    setNewRegionEcole(data.ecole);
  }, [data.ecole]);

  useEffect(() => {
    if (!isNew) return;
    const generated = generateFormationId(data.nom, data.certification);
    setData((d) => (d.id === generated ? d : { ...d, id: generated }));
  }, [isNew, data.nom, data.certification]);

  function set<K extends keyof EditableFormation>(key: K, value: EditableFormation[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setValidationErrors([]);
  }

  async function queueCityPlacement(regionName: string, cityNames: string[]) {
    try {
      const res = await fetch('/api/city-positions');
      if (!res.ok) return;
      const positions = await res.json();
      const unpinned = cityNames.filter((name) => !hasCityPosition(name, positions));
      if (unpinned.length > 0) {
        setPlacementQueue((queue) => [
          ...queue,
          ...unpinned.map((city) => ({ regionName, city })),
        ]);
      }
    } catch {
      // ignore
    }
  }

  function updateHighlight(idx: number, value: string) {
    const h = [...data.highlights];
    h[idx] = value;
    set('highlights', h);
  }

  function addHighlight() {
    if (data.highlights.length >= 10) return;
    set('highlights', [...data.highlights, '']);
  }

  function requestConfirm(message: string, action: () => void) {
    setConfirm({
      message,
      onConfirm: () => {
        action();
        setConfirm(null);
      },
    });
  }

  function removeHighlight(idx: number) {
    set('highlights', data.highlights.filter((_, i) => i !== idx));
  }

  function setVisibility(visible: boolean) {
    set('visible', visible);
    setVisPulse(visible ? 'visible' : 'hidden');
    window.setTimeout(() => setVisPulse(null), 450);
  }

  function addRegion() {
    if (!newRegion) return;
    const regionName = newRegion;
    const cities: FormationCity[] = newVille
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    const entry: FormationRegion = {
      regionName,
      ecole: newRegionEcole,
      cities,
    };
    set('regions', [...data.regions, entry]);
    setNewRegion('');
    setNewVille('');
    void queueCityPlacement(regionName, cities.map((c) => c.name));
  }

  function updateRegion(idx: number, patch: Partial<FormationRegion>) {
    set(
      'regions',
      data.regions.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  }

  function updateCity(regionIdx: number, cityIdx: number, patch: Partial<FormationCity>) {
    const regions = data.regions.map((r, i) => {
      if (i !== regionIdx) return r;
      return {
        ...r,
        cities: r.cities.map((c, j) => (j === cityIdx ? { ...c, ...patch } : c)),
      };
    });
    set('regions', regions);
  }

  function addCityToRegion(regionIdx: number, cityName: string) {
    if (!cityName.trim()) return;
    const regionName = data.regions[regionIdx]?.regionName;
    const trimmed = cityName.trim();
    const regions = data.regions.map((r, i) => {
      if (i !== regionIdx) return r;
      return { ...r, cities: [...r.cities, { name: trimmed }] };
    });
    set('regions', regions);
    if (regionName) void queueCityPlacement(regionName, [trimmed]);
  }

  function removeCity(regionIdx: number, cityIdx: number) {
    const regions = data.regions.map((r, i) => {
      if (i !== regionIdx) return r;
      return { ...r, cities: r.cities.filter((_, j) => j !== cityIdx) };
    });
    set('regions', regions);
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
    setValidationErrors([]);
  }, []);

  function removeBlock(idx: number) {
    set('blocks', data.blocks.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    const errors = validateFormation(data, isNew);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setSaving(true);
    const url = isNew ? '/api/formations' : `/api/formations/${formation!.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setBaseline(formationSnapshot(data));
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
    requestConfirm(
      `Mettre « ${data.nom} » à la corbeille ? Vous pourrez la restaurer depuis la corbeille.`,
      async () => {
        setDeleting(true);
        const res = await fetch(`/api/formations/${formation!.id}`, { method: 'DELETE' });
        if (res.ok) {
          router.push('/admin/trash');
          router.refresh();
        } else {
          alert('Erreur lors de la suppression');
          setDeleting(false);
        }
      },
    );
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
          <div className={styles.visibilityGroup} role="group" aria-label="Visibilité sur le site">
            <button
              type="button"
              className={[
                styles.visBtn,
                styles.visBtnOn,
                data.visible ? styles.visBtnActive : '',
                visPulse === 'visible' ? styles.visBtnPulse : '',
              ].join(' ')}
              onClick={() => setVisibility(true)}
            >
              Visible
            </button>
            <button
              type="button"
              className={[
                styles.visBtn,
                styles.visBtnOff,
                !data.visible ? styles.visBtnActive : '',
                visPulse === 'hidden' ? styles.visBtnPulse : '',
              ].join(' ')}
              onClick={() => setVisibility(false)}
            >
              Invisible
            </button>
          </div>
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
          {isDirty && (
            <button
              type="button"
              className={styles.btnSave}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {validationErrors.length > 0 && (
          <div className={styles.errorBox} role="alert">
            <p className={styles.errorTitle}>Impossible d&apos;enregistrer :</p>
            <ul className={styles.errorList}>
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── École gestionnaire ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>École gestionnaire</h2>
          <p className={styles.hint}>
            Définit la couleur par défaut de la formation sur le site (orange Stade, rouge Spor).
          </p>
          <div className={styles.ecoleSegmented}>
            {ECOLE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={[
                  styles.ecoleBtn,
                  opt === 'stade-formation' ? styles.ecoleBtnStade : '',
                  opt === 'sporformation' ? styles.ecoleBtnSpor : '',
                  opt === 'both' ? styles.ecoleBtnBoth : '',
                  data.ecole === opt ? styles.ecoleBtnActive : '',
                ].join(' ')}
                onClick={() => set('ecole', opt)}
              >
                {ECOLE_LABELS[opt]}
              </button>
            ))}
          </div>
        </section>

        {/* ── Identité ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Identité</h2>
          {isNew && (
            <div className={styles.field}>
              <label className={styles.label}>ID (slug URL) - généré automatiquement</label>
              <input
                className={`${styles.input} ${styles.inputReadonly}`}
                value={data.id}
                readOnly
                placeholder="bpjeps-nom-formation"
              />
              <p className={styles.hint}>
                Basé sur le nom et la certification (espaces remplacés par des tirets).
              </p>
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
          <div className={styles.chipSection}>
            <label className={styles.label}>Cases d&apos;information</label>
            <p className={styles.hint}>
              Petits badges affichés sous la description sur la page de la formation (ex. : 1 an, Alternance, Qualiopi). Maximum 10.
            </p>
            <div className={styles.chipGrid}>
            {data.highlights.map((h, i) => (
              <div key={i} className={styles.chipField}>
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => {
                    const label = h.trim();
                    requestConfirm(
                      label
                        ? `Êtes-vous sûr de vouloir supprimer « ${label} » ?`
                        : 'Êtes-vous sûr de vouloir supprimer cette case d\'information ?',
                      () => removeHighlight(i),
                    );
                  }}
                  aria-label={`Supprimer la case ${i + 1}`}
                >
                  ×
                </button>
                <label className={styles.label}>Case {i + 1}</label>
                <input
                  className={styles.input}
                  value={h}
                  onChange={(e) => updateHighlight(i, e.target.value)}
                  placeholder="Ex: 1 an"
                />
              </div>
            ))}
            {data.highlights.length < 10 && (
              <button
                type="button"
                className={styles.chipAdd}
                onClick={addHighlight}
                aria-label="Ajouter une case d'information"
              >
                <span className={styles.chipAddIcon}>+</span>
                <span className={styles.chipAddLabel}>Ajouter une case</span>
              </button>
            )}
            </div>
          </div>
        </section>

        {/* ── Régions ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Régions & lieux</h2>
          <div className={styles.regionList}>
            {data.regions.map((region, regionIdx) => (
              <div key={`${region.regionName}-${regionIdx}`} className={styles.regionCard}>
                <div className={styles.regionCardHead}>
                  <strong className={styles.regionName}>{region.regionName}</strong>
                  <EcoleSelect
                    value={region.ecole}
                    defaultEcole={data.ecole}
                    onChange={(ecole) => updateRegion(regionIdx, { ecole })}
                    className={styles.selectSmall}
                  />
                  <button
                    type="button"
                    className={styles.regionRemove}
                    onClick={() => removeRegion(regionIdx)}
                    aria-label={`Supprimer ${region.regionName}`}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.cityList}>
                  {region.cities.map((city, cityIdx) => (
                    <div key={`${city.name}-${cityIdx}`} className={styles.cityRow}>
                      <span className={styles.cityName}>{city.name}</span>
                      <EcoleSelect
                        value={city.ecole}
                        defaultEcole={region.ecole ?? data.ecole}
                        onChange={(ecole) => updateCity(regionIdx, cityIdx, { ecole })}
                        className={styles.selectSmall}
                      />
                      <button
                        type="button"
                        className={styles.cityRemove}
                        onClick={() => removeCity(regionIdx, cityIdx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.addRow}>
                  <AddCityInput
                    regionName={region.regionName}
                    onAdd={(cityName) => addCityToRegion(regionIdx, cityName)}
                  />
                </div>
              </div>
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
            <EcoleSelect
              value={newRegionEcole}
              defaultEcole={data.ecole}
              onChange={setNewRegionEcole}
              className={styles.select}
            />
            <CityAutocomplete
              regionName={newRegion}
              value={newVille}
              onChange={(v) => setNewVille(v)}
              placeholder="Villes (Bordeaux, Agen…)"
            />
            <button type="button" className={styles.addBtn} onClick={addRegion} disabled={!newRegion}>
              + Ajouter
            </button>
          </div>
          <p className={styles.hint}>
            Chaque région et ville peut être gérée par Stade Formation, SporFormation ou les deux.
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

      {placementQueue[0] && (
        <CityPlacementModal
          regionName={placementQueue[0].regionName}
          cityName={placementQueue[0].city}
          onComplete={() => setPlacementQueue((q) => q.slice(1))}
          onSkip={() => setPlacementQueue((q) => q.slice(1))}
        />
      )}

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
