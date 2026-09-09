import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useMenuCentres, useMenuFamilles, useMenuFormationsALaUne } from '~/composables/useMenuData'

const fetchMock = vi.fn()
const directusListMock = vi.fn()

vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'http://api.test' } }))
vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('useDirectusList', (...args: unknown[]) => directusListMock(...args))
vi.stubGlobal('logServerError', vi.fn())
vi.stubGlobal('computed', computed)
vi.stubGlobal('useAsyncData', async (_key: string, handler: () => Promise<unknown>) => ({
  data: ref(await handler())
}))

describe('useMenuData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('useMenuFamilles', () => {
    it('renvoie les familles du catalogue avec le nom Directus, triées et limitées à 4', async () => {
      directusListMock.mockResolvedValue(
        ref([
          { slug: 'sante-secours', name: 'Santé & secours' },
          { slug: 'caces', name: 'CACES' },
          { slug: 'habilitations', name: 'Habilitations électriques' },
          { slug: 'qualite', name: 'Qualité' },
          { slug: 'management', name: 'Management' },
          { slug: 'last-one', name: 'Last one' }
        ])
      )
      fetchMock.mockResolvedValue([
        { slug: 'sante-secours', count: 8 },
        { slug: 'management', count: 3 },
        { slug: 'caces', count: 12 },
        { slug: 'habilitations', count: 5 },
        { slug: 'qualite', count: 4 },
        { slug: 'last-one', count: 1 }
      ])

      const familles = await useMenuFamilles()

      expect(familles.value).toHaveLength(4)
      expect(familles.value).toEqual([
        { slug: 'caces', label: 'CACES', count: 12 },
        { slug: 'sante-secours', label: 'Santé & secours', count: 8 },
        { slug: 'habilitations', label: 'Habilitations électriques', count: 5 },
        { slug: 'qualite', label: 'Qualité', count: 4 }
      ])
      expect(directusListMock).toHaveBeenCalledWith(
        'familles_formation',
        'menu-familles-names',
        expect.objectContaining({ fields: ['slug', 'name'] })
      )
      expect(fetchMock).toHaveBeenCalledWith('http://api.test/families')
    })

    it('dégrade en liste vide si /families échoue', async () => {
      directusListMock.mockResolvedValue(ref([]))
      fetchMock.mockRejectedValue(new Error('api down'))

      const familles = await useMenuFamilles()

      expect(familles.value).toEqual([])
    })

    it('fallback sur humanizeSlug si le nom Directus est absent', async () => {
      directusListMock.mockResolvedValue(ref([]))
      fetchMock.mockResolvedValue([{ slug: 'unknown-family', count: 1 }])

      const familles = await useMenuFamilles()

      expect(familles.value).toEqual([
        { slug: 'unknown-family', label: 'Unknown Family', count: 1 }
      ])
    })
  })

  describe('useMenuCentres', () => {
    const centres = Array.from({ length: 12 }, (_, i) => ({
      slug: `centre-${i}`,
      name: `Centre ${i}`,
      city: `Ville ${i}`,
      department: `Département ${i}`,
      region: i < 6 ? 'Île-de-France' : 'Auvergne-Rhône-Alpes'
    }))

    it('groupe les centres par région et limite à 4 par région et 4 régions', async () => {
      directusListMock.mockResolvedValue(ref(centres))

      const { regions, centresParRegion } = await useMenuCentres()

      expect(regions.value).toHaveLength(2)
      expect(regions.value[0]).toEqual({
        slug: 'auvergne-rhone-alpes',
        label: 'Auvergne-Rhône-Alpes',
        count: 6
      })
      expect(regions.value[1]).toEqual({
        slug: 'ile-de-france',
        label: 'Île-de-France',
        count: 6
      })
      expect(centresParRegion.value.get('Île-de-France')).toHaveLength(4)
    })

    it('regroupe les centres sans région sous « Autres régions »', async () => {
      directusListMock.mockResolvedValue(ref([{ ...centres[0], slug: 'orphelin', region: null }]))

      const { regions, centresParRegion } = await useMenuCentres()

      expect(regions.value[0]).toEqual({
        slug: 'autres-regions',
        label: 'Autres régions',
        count: 1
      })
      expect(centresParRegion.value.get('Autres régions')![0]!.slug).toBe('orphelin')
    })
  })

  describe('useMenuFormationsALaUne', () => {
    it('mappe les formations vers des liens famille/slug et appelle /courses avec limit=6', async () => {
      fetchMock.mockResolvedValue({
        items: [
          { slug: 'sst-initial', title: 'SST', familySlug: 'sante' },
          { slug: 'orpheline', title: 'Sans famille', familySlug: null }
        ],
        total: 2,
        page: 1,
        pageSize: 6
      })

      const formations = await useMenuFormationsALaUne()

      expect(formations.value).toEqual([
        { slug: 'sst-initial', label: 'SST', to: '/formations/sante/sst-initial' },
        { slug: 'orpheline', label: 'Sans famille', to: '/formations' }
      ])
      expect(fetchMock).toHaveBeenCalledWith(
        'http://api.test/courses',
        expect.objectContaining({ query: expect.objectContaining({ limit: 6 }) })
      )
    })

    it('dégrade en liste vide si /courses échoue', async () => {
      fetchMock.mockRejectedValue(new Error('api down'))

      const formations = await useMenuFormationsALaUne()

      expect(formations.value).toEqual([])
    })
  })
})
