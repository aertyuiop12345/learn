import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { buildCentresQuery, useCentres, useCentreDepartments } from '~/composables/useCentres'

vi.mock('@directus/sdk', () => ({
  readItems: vi.fn((collection: string, query: unknown) => ({ collection, query }))
}))

const requestMock = vi.fn()

vi.stubGlobal('useDirectusClient', () => ({ request: requestMock }))
vi.stubGlobal('logServerError', vi.fn())
vi.stubGlobal('useAsyncData', async (_key: unknown, handler: () => Promise<unknown>) => ({
  data: ref(await handler()),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn()
}))

beforeEach(() => {
  vi.clearAllMocks()
  requestMock.mockResolvedValue([])
})

describe('buildCentresQuery', () => {
  it('filtre sur le statut published seul par défaut', () => {
    const query = buildCentresQuery({})

    expect(query.filter).toEqual({ status: { _eq: 'published' } })
    expect(query.limit).toBe(-1)
    expect(query.sort).toEqual(['sort', 'name'])
  })

  it('filtre le département sur department OU departments_covered', () => {
    const query = buildCentresQuery({ department: 'Rhône' }) as {
      filter: { _and: Array<Record<string, unknown>> }
    }

    expect(query.filter._and[1]).toEqual({
      _or: [{ department: { _eq: 'Rhône' } }, { departments_covered: { _contains: 'Rhône' } }]
    })
  })

  it('recherche insensible à la casse sur nom, ville, CP, adresse et specialties', () => {
    const query = buildCentresQuery({ search: ' vitry ' }) as {
      filter: { _and: Array<Record<string, unknown>> }
    }

    expect(query.filter._and[1]).toEqual({
      _or: [
        { name: { _icontains: 'vitry' } },
        { city: { _icontains: 'vitry' } },
        { postal_code: { _icontains: 'vitry' } },
        { address: { _icontains: 'vitry' } },
        { specialties: { _contains: 'vitry' } }
      ]
    })
  })

  it('combine département et recherche dans un _and', () => {
    const query = buildCentresQuery({ department: 'Rhône', search: 'Lyon' }) as {
      filter: { _and: Array<Record<string, unknown>> }
    }

    expect(query.filter._and).toHaveLength(3)
    expect(query.filter._and[0]).toEqual({ status: { _eq: 'published' } })
  })
})

describe('useCentres', () => {
  it('interroge la collection centres avec la query construite', async () => {
    requestMock.mockResolvedValue([{ slug: 'lyon' }])

    const { data } = await useCentres(ref({ search: 'Lyon' }))

    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ collection: 'centres' }))
    expect(data.value).toEqual([{ slug: 'lyon' }])
  })

  it('dégrade à [] en cas d’erreur Directus', async () => {
    requestMock.mockRejectedValue(new Error('network'))

    const { data } = await useCentres(ref({}))

    expect(data.value).toEqual([])
  })
})

describe('useCentreDepartments', () => {
  it('déduplique department et departments_covered, trié fr', async () => {
    requestMock.mockResolvedValue([
      { department: 'Rhône', departments_covered: ['69', '01'] },
      { department: 'Val-de-Marne', departments_covered: ['94'] },
      { department: null, departments_covered: null }
    ])

    const departments = await useCentreDepartments()

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ fields: ['department', 'departments_covered'] })
      })
    )
    expect(departments.value).toEqual(['01', '69', '94', 'Rhône', 'Val-de-Marne'])
  })

  it('dégrade à [] en cas d’erreur Directus', async () => {
    requestMock.mockRejectedValue(new Error('network'))

    const departments = await useCentreDepartments()

    expect(departments.value).toEqual([])
  })
})
