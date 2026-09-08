import { describe, expect, it } from 'vitest'
import {
  MODALITY_OPTIONS,
  DURATION_OPTIONS,
  CERTIFICATION_OPTIONS,
  getFilterLabel,
  normalizeFamilySlug
} from '~/utils/catalog-filters'

describe('catalog-filters', () => {
  it('contains all modality options', () => {
    expect(MODALITY_OPTIONS.map((o) => o.key)).toEqual([
      'presentiel',
      'distanciel',
      'hybride',
      'intra',
      'inter'
    ])
  })

  it('contains all duration options', () => {
    expect(DURATION_OPTIONS.map((o) => o.key)).toEqual(['courte', 'moyenne', 'longue'])
  })

  it('contains all certification options', () => {
    expect(CERTIFICATION_OPTIONS.map((o) => o.key)).toEqual([
      'certification',
      'habilitation',
      'recyclage',
      'reglementaire'
    ])
  })

  it('returns family labels', () => {
    expect(getFilterLabel('families', 'caces')).toBe("CACES & conduite d'engins")
    expect(getFilterLabel('families', 'securite')).toBe('Sécurité & prévention')
  })

  it('returns modality and certification labels', () => {
    expect(getFilterLabel('modalities', 'presentiel')).toBe('Présentiel')
    expect(getFilterLabel('certifications', 'habilitation')).toBe('Habilitation')
  })

  it('returns the key itself when label is unknown', () => {
    expect(getFilterLabel('families', 'unknown')).toBe('unknown')
    expect(getFilterLabel('durations', 'unknown')).toBe('unknown')
  })

  it('returns location key as-is', () => {
    expect(getFilterLabel('location', 'Île-de-France')).toBe('Île-de-France')
  })

  it('normalizes family slugs to first segment', () => {
    expect(normalizeFamilySlug('caces-conduite-engins')).toBe('caces')
    expect(normalizeFamilySlug('securite-prevention')).toBe('securite')
    expect(normalizeFamilySlug('only')).toBe('only')
    expect(normalizeFamilySlug('')).toBe('')
  })
})
