export interface FilterOption {
  key: string
  label: string
  count?: number
}

export const MODALITY_OPTIONS: FilterOption[] = [
  { key: 'presentiel', label: 'Présentiel' },
  { key: 'distanciel', label: 'Distanciel' },
  { key: 'hybride', label: 'Hybride' },
  { key: 'intra', label: 'Intra' },
  { key: 'inter', label: 'Inter' }
]

export const DURATION_OPTIONS: FilterOption[] = [
  { key: 'courte', label: 'Courte (≤ 1 jour)' },
  { key: 'moyenne', label: '2 à 5 jours' },
  { key: 'longue', label: 'Parcours long' }
]

export const CERTIFICATION_OPTIONS: FilterOption[] = [
  { key: 'certification', label: 'Certification' },
  { key: 'habilitation', label: 'Habilitation' },
  { key: 'recyclage', label: 'Recyclage' },
  { key: 'reglementaire', label: 'Réglementaire' }
]

export const MODALITY_LABELS: Record<string, string> = {
  presentiel: 'Présentiel',
  distanciel: 'Distanciel',
  hybride: 'Hybride',
  intra: 'Intra',
  inter: 'Inter'
}

export const DURATION_LABELS: Record<string, string> = {
  courte: 'Courte (≤ 1 jour)',
  moyenne: '2 à 5 jours',
  longue: 'Parcours long'
}

export const CERTIFICATION_LABELS: Record<string, string> = {
  certification: 'Certification',
  habilitation: 'Habilitation',
  recyclage: 'Recyclage',
  reglementaire: 'Réglementaire'
}

export const FAMILY_LABELS: Record<string, string> = {
  securite: 'Sécurité & prévention',
  caces: "CACES & conduite d'engins",
  habilitations: 'Habilitations électriques',
  sante: 'Santé & secours',
  management: 'Management'
}

export function getFilterLabel(
  group: 'families' | 'modalities' | 'durations' | 'certifications' | 'location',
  key: string
): string {
  if (group === 'families') return FAMILY_LABELS[key] ?? key
  if (group === 'modalities') return MODALITY_LABELS[key] ?? key
  if (group === 'durations') return DURATION_LABELS[key] ?? key
  if (group === 'certifications') return CERTIFICATION_LABELS[key] ?? key
  return key
}

export function normalizeFamilySlug(slug: string): string {
  return slug.split('-')[0] ?? 'autre'
}
