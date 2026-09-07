import type { CourseListItem } from '@learnup/types'
import { describe, expect, it } from 'vitest'
import {
  buildCertifications,
  buildDuration,
  buildMeta,
  mapCourse,
  staticCatalog
} from '~/composables/useCatalog'

const course: CourseListItem = {
  id: 1,
  slug: 'caces-r489-chariots-elevateurs',
  title: 'CACES R489 — chariots élévateurs',
  description: 'Formation de conduite.',
  durationDays: 3,
  durationHours: null,
  price: null,
  cpf: null,
  cpfCode: null,
  certification: 'Certification CACES',
  certifierName: 'Opérateur réglementaire',
  category: null,
  familySlug: 'caces-conduite-engins',
  centerSlug: null,
  imageUrl: null,
  status: 'published',
  seoTitle: null,
  seoDescription: null,
  seoCanonical: null
}

describe('useCatalog helpers', () => {
  it('builds durations buckets', () => {
    expect(buildDuration(0)).toBe('courte')
    expect(buildDuration(1)).toBe('courte')
    expect(buildDuration(2)).toBe('moyenne')
    expect(buildDuration(5)).toBe('moyenne')
    expect(buildDuration(6)).toBe('longue')
  })

  it('builds meta from duration, certification and certifier', () => {
    expect(buildMeta(course)).toBe('3 jours · Certification CACES · Opérateur réglementaire')
  })

  it('builds certifications from course data', () => {
    expect(buildCertifications(course)).toEqual(['certification', 'reglementaire'])
  })

  it('detects habilitation keyword', () => {
    const habilitation: CourseListItem = {
      ...course,
      certification: 'Habilitation électrique',
      certifierName: null
    }
    expect(buildCertifications(habilitation)).toEqual(['certification', 'habilitation'])
  })

  it('detects recyclage keyword', () => {
    const recyclage: CourseListItem = {
      ...course,
      certification: 'Recyclage SST',
      certifierName: null
    }
    expect(buildCertifications(recyclage)).toEqual(['certification', 'recyclage'])
  })

  it('maps a course to a FormationItem', () => {
    const mapped = mapCourse(course)

    expect(mapped.slug).toBe(course.slug)
    expect(mapped.title).toBe(course.title)
    expect(mapped.family).toBe("CACES & conduite d'engins")
    expect(mapped.familyKey).toBe('caces')
    expect(mapped.duration).toBe('moyenne')
    expect(mapped.days).toBe(3)
    expect(mapped.certifications).toEqual(['certification', 'reglementaire'])
    expect(mapped.to).toBe('/formations/caces-conduite-engins/caces-r489-chariots-elevateurs')
  })

  it('falls back to autre family when familySlug is missing', () => {
    const mapped = mapCourse({ ...course, familySlug: null })

    expect(mapped.family).toBe('autre')
    expect(mapped.familyKey).toBe('autre')
    expect(mapped.to).toBe('/formations/caces-r489-chariots-elevateurs')
  })

  it('exposes a non-empty static catalog fallback', () => {
    expect(staticCatalog.length).toBeGreaterThan(0)
    expect(staticCatalog[0]).toHaveProperty('slug')
    expect(staticCatalog[0]).toHaveProperty('to')
  })
})
