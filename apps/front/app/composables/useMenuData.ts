// composables/useMenuData.ts
// Données des méga-menus et du menu mobile — chargées en SSR une seule fois
// (clés useAsyncData stables → dédupliquées et embarquées dans le payload).
// Sources : API catalogue (/families, /courses) + Directus (centres).
// Dégradation gracieuse : [] en cas d'erreur, log serveur.

import type {
  Centre,
  CourseListItem,
  FamilleFormation,
  FamilyWithCount,
  Paginated
} from '@learnup/types'

export interface MenuFamille {
  slug: string
  label: string
  count: number
}

export interface MenuFormation {
  slug: string
  label: string
  to: string
}

export interface MenuCentre {
  slug: string
  name: string
  city: string | null
  department: string | null
  region: string | null
}

export interface MenuRegion {
  slug: string
  label: string
  count: number
}

const DIACRITIC_PATTERN = /[̀-ͯ]/g

/** Limites d’affichage pour chaque section de mega-menu. */
const MAX_FAMILLES = 4
const MAX_REGIONS = 4
const MAX_CENTRES_PER_REGION = 4
const MAX_FORMATIONS_A_LA_UNE = 6

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITIC_PATTERN, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function humanizeSlug(slug: string): string {
  if (!slug) return ''
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Familles depuis le catalogue API (`/families`) + noms Directus — max MAX_FAMILLES. */
export async function useMenuFamilles() {
  const config = useRuntimeConfig()

  const names = await useDirectusList<FamilleFormation>(
    'familles_formation',
    'menu-familles-names',
    {
      fields: ['slug', 'name'],
      filter: { status: { _eq: 'published' } },
      limit: -1
    }
  )

  const nameBySlug = computed(() => {
    const map = new Map<string, string>()
    for (const family of (names.value ?? []) as FamilleFormation[]) {
      if (family.slug && family.name) map.set(family.slug, family.name)
    }
    return map
  })

  const { data } = await useAsyncData<MenuFamille[]>('menu-familles', async () => {
    const counts = await $fetch<FamilyWithCount[]>(`${config.public.apiBase}/families`).catch(
      (error: unknown) => {
        if (import.meta.server) {
          logServerError('[useMenuFamilles] /families fetch failed:', error)
        }
        return [] as FamilyWithCount[]
      }
    )

    return counts
      .map((family) => ({
        slug: family.slug,
        label: nameBySlug.value.get(family.slug) ?? humanizeSlug(family.slug),
        count: family.count
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, MAX_FAMILLES)
  })

  return data
}

/** Centres publiés, groupés par région pour les menus. */
export async function useMenuCentres() {
  const centres = await useDirectusList<Centre>('centres', 'menu-centres', {
    fields: ['slug', 'name', 'city', 'department', 'region'],
    filter: { status: { _eq: 'published' } },
    limit: -1,
    sort: ['sort', 'name']
  })

  const fullCentresParRegion = computed(() => {
    const map = new Map<string, MenuCentre[]>()
    for (const centre of centres.value ?? []) {
      const region = centre.region?.trim() || 'Autres régions'
      const list = map.get(region) ?? []
      list.push({
        slug: centre.slug,
        name: centre.name,
        city: centre.city,
        department: centre.department,
        region: centre.region
      })
      map.set(region, list)
    }
    return map
  })

  const centresParRegion = computed(() => {
    const map = new Map<string, MenuCentre[]>()
    for (const [region, list] of fullCentresParRegion.value) {
      map.set(
        region,
        list.length > MAX_CENTRES_PER_REGION ? list.slice(0, MAX_CENTRES_PER_REGION) : list
      )
    }
    return map
  })

  const regions = computed<MenuRegion[]>(() =>
    [...fullCentresParRegion.value.entries()]
      .map(([label, list]) => ({ slug: slugify(label), label, count: list.length }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, MAX_REGIONS)
  )

  return { regions, centresParRegion }
}

/** Six dernières formations publiées — colonne « À la une » du méga-menu. */
export async function useMenuFormationsALaUne() {
  const config = useRuntimeConfig()

  const { data } = await useAsyncData<MenuFormation[]>('menu-formations-une', async () => {
    try {
      const result = await $fetch<Paginated<CourseListItem>>(`${config.public.apiBase}/courses`, {
        query: { limit: MAX_FORMATIONS_A_LA_UNE, page: 1, sort: 'updatedAt', order: 'desc' }
      })
      return result.items.map((course) => ({
        slug: course.slug,
        label: course.title,
        to: course.familySlug ? `/formations/${course.familySlug}/${course.slug}` : '/formations'
      }))
    } catch (error) {
      if (import.meta.server) {
        logServerError('[useMenuFormationsALaUne] /courses fetch failed:', error)
      }
      return [] as MenuFormation[]
    }
  })

  return data
}
