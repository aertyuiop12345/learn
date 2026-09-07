import type { CourseListItem, Paginated } from '@learnup/types'
import { FAMILY_LABELS, normalizeFamilySlug } from '@/utils/catalog-filters'

export interface FormationItem {
  slug: string
  family: string
  familyKey: string
  title: string
  description: string
  meta: string
  days: number
  modalities: string[]
  duration: 'courte' | 'moyenne' | 'longue'
  certifications: string[]
  region: string
  status?: { type: 'success' | 'warning' | 'neutral'; label: string }
  to: string
}

interface CatalogResult {
  formations: FormationItem[]
}

export function buildDuration(days: number): 'courte' | 'moyenne' | 'longue' {
  if (days <= 1) return 'courte'
  if (days <= 5) return 'moyenne'
  return 'longue'
}

export function buildMeta(course: CourseListItem): string {
  const parts: string[] = []
  if (course.durationDays) parts.push(`${course.durationDays} jours`)
  if (course.certification) parts.push(course.certification)
  if (course.certifierName && course.certifierName !== course.certification) {
    parts.push(course.certifierName)
  }
  return parts.join(' · ')
}

export function buildCertifications(course: CourseListItem): string[] {
  const certs: string[] = []
  const text = [course.certification, course.certifierName]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .join(' ')
    .toLowerCase()

  if (course.certification) certs.push('certification')
  if (text.includes('habilitation')) certs.push('habilitation')
  if (text.includes('recyclage')) certs.push('recyclage')
  if (text.includes('reglementaire') || text.includes('réglementaire')) certs.push('reglementaire')

  return certs
}

export function mapCourse(course: CourseListItem): FormationItem {
  const familySlug = course.familySlug ?? 'autre'
  const familyKey = normalizeFamilySlug(familySlug)
  const days = course.durationDays ?? 1

  return {
    slug: course.slug,
    family: FAMILY_LABELS[familyKey] ?? familySlug,
    familyKey,
    title: course.title,
    description: course.description ?? '',
    meta: buildMeta(course),
    days,
    modalities: ['presentiel', 'inter', 'intra'],
    duration: buildDuration(days),
    certifications: buildCertifications(course),
    region: 'National',
    to:
      familySlug === 'autre'
        ? `/formations/${course.slug}`
        : `/formations/${familySlug}/${course.slug}`
  }
}

export const staticCatalog: FormationItem[] = [
  {
    slug: 'caces-r489-chariots-elevateurs',
    family: "CACES · Conduite d'engins",
    familyKey: 'caces',
    title: 'CACES R489 — chariots élévateurs',
    description:
      'Formation à la conduite en sécurité des chariots de manutention à conducteur non accompagné.',
    meta: '2 à 5 jours · Inter / intra · Recyclage : 5 ans',
    days: 3,
    modalities: ['presentiel', 'inter', 'intra'],
    duration: 'moyenne',
    certifications: ['certification', 'reglementaire'],
    region: 'Île-de-France',
    status: { type: 'success', label: 'Sessions ce mois-ci' },
    to: '/formations/caces-conduite-engins/caces-r489-chariots-elevateurs'
  },
  {
    slug: 'sst',
    family: 'Sécurité & prévention',
    familyKey: 'securite',
    title: 'SST — Sauveteur Secouriste du Travail',
    description: 'Apprendre les gestes de premiers secours et de mise en sécurité en entreprise.',
    meta: '2 jours · Présentiel · Recyclage : 2 ans',
    days: 2,
    modalities: ['presentiel', 'inter'],
    duration: 'moyenne',
    certifications: ['certification', 'reglementaire'],
    region: 'Île-de-France',
    to: '/formations/securite-prevention/sst'
  },
  {
    slug: 'habilitation-electrique-h0-b0',
    family: 'Habilitations électriques',
    familyKey: 'habilitations',
    title: 'Habilitation électrique H0-B0',
    description: 'Sensibilisation aux risques électriques pour le personnel non électricien.',
    meta: '1 jour · Présentiel · Recyclage : 3 ans',
    days: 1,
    modalities: ['presentiel', 'intra', 'inter'],
    duration: 'courte',
    certifications: ['habilitation', 'reglementaire'],
    region: 'National',
    to: '/formations/habilitations-electriques/habilitation-electrique-h0-b0'
  },
  {
    slug: 'incendie-equipier-premiere-intervention',
    family: 'Sécurité & prévention',
    familyKey: 'securite',
    title: 'Incendie — Équipier de première intervention',
    description: 'Maîtriser les techniques de lutte contre l’incendie et l’évacuation.',
    meta: '1 jour · Présentiel · Recyclage : 1 an',
    days: 1,
    modalities: ['presentiel', 'intra'],
    duration: 'courte',
    certifications: ['reglementaire'],
    region: 'Auvergne-Rhône-Alpes',
    to: '/formations/securite-prevention/incendie-equipier-premiere-intervention'
  },
  {
    slug: 'travaux-hauteur-pla-forme-elev-mobile',
    family: 'Sécurité & prévention',
    familyKey: 'securite',
    title: 'Travaux en hauteur sur PEMP',
    description: 'Conduite et utilisation des plates-formes élévateurs mobiles de personnes.',
    meta: '1 à 3 jours · Présentiel · CACES R486',
    days: 3,
    modalities: ['presentiel', 'inter'],
    duration: 'moyenne',
    certifications: ['certification', 'reglementaire'],
    region: 'Île-de-France',
    status: { type: 'warning', label: 'Session le 18/09' },
    to: '/formations/securite-prevention/travaux-hauteur-pla-forme-elev-mobile'
  },
  {
    slug: 'gestes-postures',
    family: 'Santé & secours',
    familyKey: 'sante',
    title: 'Gestes & postures en entreprise',
    description: 'Prévention des troubles musculo-squelettiques par l’adoption de bons gestes.',
    meta: '1 jour · Présentiel',
    days: 1,
    modalities: ['presentiel'],
    duration: 'courte',
    certifications: ['reglementaire'],
    region: 'Occitanie',
    to: '/formations/sante-secours/gestes-postures'
  },
  {
    slug: 'management-qse',
    family: 'Management',
    familyKey: 'management',
    title: 'Management QSE',
    description:
      'Accompagner les managers dans la maîtrise des risques qualité, sécurité et environnement.',
    meta: '3 jours · Distanciel / hybride',
    days: 3,
    modalities: ['distanciel', 'hybride'],
    duration: 'moyenne',
    certifications: ['certification'],
    region: 'National',
    to: '/formations/management/management-qse'
  },
  {
    slug: 'hauteur-echelles',
    family: 'Sécurité & prévention',
    familyKey: 'securite',
    title: 'Travaux en hauteur sur échelles et escabeaux',
    description: 'Prévenir les chutes de hauteur lors des interventions sur échelles.',
    meta: '0,5 jour · Présentiel · Recyclage : 1 an',
    days: 1,
    modalities: ['presentiel', 'intra'],
    duration: 'courte',
    certifications: ['reglementaire'],
    region: 'Hauts-de-France',
    to: '/formations/securite-prevention/hauteur-echelles'
  }
]

export async function useCatalog() {
  const config = useRuntimeConfig()

  const { data, pending, error } = await useAsyncData<CatalogResult>(
    'catalog',
    async () => {
      try {
        const response = await $fetch<Paginated<CourseListItem>>(
          `${config.public.apiBase}/courses?limit=100`
        )

        if (!response.items?.length) {
          throw new Error('catalog api returned empty list')
        }

        return {
          formations: response.items.map(mapCourse)
        }
      } catch (err) {
        if (process.server) {
          logServerError('[useCatalog] catalog fetch failed:', err)
        }
        throw err
      }
    },
    {
      default: () => ({ formations: staticCatalog })
    }
  )

  return { data, pending, error }
}
