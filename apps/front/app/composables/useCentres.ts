import { readItems } from '@directus/sdk'
import type { Centre } from '@learnup/types'
import { toValue, type MaybeRefOrGetter } from 'vue'

export interface CentresQuery {
  department?: string
  search?: string
}

const CENTRE_LIST_FIELDS = [
  'slug',
  'name',
  'address',
  'city',
  'postal_code',
  'department',
  'departments_covered',
  'region',
  'specialties',
  'latitude',
  'longitude'
]

/**
 * Filtre Directus équivalent à l'ancien filtrage client : département =
 * `department` exact OU membre de `departments_covered` (JSON) ; recherche
 * insensible à la casse sur nom/ville/CP/adresse + tag exact dans
 * `specialties` (champ JSON, `_icontains` non applicable).
 */
export function buildCentresQuery(query: CentresQuery): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [{ status: { _eq: 'published' } }]

  const department = query.department?.trim()
  if (department) {
    conditions.push({
      _or: [{ department: { _eq: department } }, { departments_covered: { _contains: department } }]
    })
  }

  const search = query.search?.trim()
  if (search) {
    conditions.push({
      _or: [
        { name: { _icontains: search } },
        { city: { _icontains: search } },
        { postal_code: { _icontains: search } },
        { address: { _icontains: search } },
        { specialties: { _contains: search } }
      ]
    })
  }

  return {
    fields: CENTRE_LIST_FIELDS,
    filter: conditions.length === 1 ? conditions[0] : { _and: conditions },
    limit: -1,
    sort: ['sort', 'name']
  }
}

function cacheKey(query: CentresQuery): string {
  return `${query.department?.trim() || 'all'}:${query.search?.trim() || ''}`
}

/**
 * Liste des centres filtrée côté Directus — refetch à chaque changement de
 * `query` (watch useAsyncData). Dégrade à [] en cas d'échec, loggé serveur.
 *
 * Retourné sans `await` : à l'appelant de décider d'attendre ou non, pour
 * qu'en navigation client la page monte tout de suite et `pending` pilote
 * l'état de chargement du champ de recherche.
 */
export function useCentres(query: MaybeRefOrGetter<CentresQuery>) {
  const directus = useDirectusClient()

  return useAsyncData<Centre[]>(
    `centres:${cacheKey(toValue(query))}`,
    async () => {
      try {
        return await directus.request<Centre[]>(
          readItems('centres', buildCentresQuery(toValue(query)))
        )
      } catch (err) {
        if (import.meta.server) {
          logServerError('[useCentres] centres fetch failed:', err)
        }
        return []
      }
    },
    {
      watch: [() => cacheKey(toValue(query))]
    }
  )
}

/**
 * Liste des valeurs de département pour le filtre — requête légère dédiée
 * (2 champs) puisque la liste filtrée ne couvre que le département courant.
 */
export function useCentreDepartments() {
  const directus = useDirectusClient()

  return useAsyncData<string[]>('centres-departments', async () => {
    try {
      const rows = await directus.request<
        Array<Pick<Centre, 'department' | 'departments_covered'>>
      >(
        readItems('centres', {
          fields: ['department', 'departments_covered'],
          filter: { status: { _eq: 'published' } },
          limit: -1
        })
      )
      const set = new Set<string>()
      for (const row of rows) {
        if (row.department) set.add(row.department)
        for (const dept of row.departments_covered ?? []) {
          if (dept) set.add(dept)
        }
      }
      return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
    } catch (err) {
      if (import.meta.server) {
        logServerError('[useCentreDepartments] departments fetch failed:', err)
      }
      return []
    }
  })
}
