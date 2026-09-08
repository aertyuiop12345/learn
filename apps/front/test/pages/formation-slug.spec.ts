import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref, Suspense, watchEffect } from 'vue'
import LoadError from '~/components/ErrorState/LoadError.vue'
import NotFound from '~/components/ErrorState/NotFound.vue'
import FormationPage from '~/pages/formations/[famille]/[slug].vue'

const navigateToMock = vi.fn()
const refreshMock = vi.fn()
const setResponseStatusMock = vi.fn()
const seoMock = vi.fn()
const headMock = vi.fn()

interface RouteMock {
  params: { famille: string; slug: string }
  query: Record<string, string>
  path: string
  meta: Record<string, unknown>
}

let routeMock: RouteMock
let forceError: Error | null = null

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('watchEffect', watchEffect)
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useRoute', () => routeMock)
vi.stubGlobal('useAsyncData', async (_key: string, handler: () => Promise<unknown>) => {
  if (forceError) {
    return { data: ref(null), error: ref(forceError), refresh: refreshMock }
  }
  try {
    return { data: ref(await handler()), error: ref(null), refresh: refreshMock }
  } catch (e) {
    return { data: ref(null), error: ref(e), refresh: refreshMock }
  }
})
vi.stubGlobal('useRequestEvent', () => undefined)
vi.stubGlobal('setResponseStatus', setResponseStatusMock)
vi.stubGlobal('useContentSeo', seoMock)
vi.stubGlobal('useHead', headMock)
vi.stubGlobal('navigateTo', navigateToMock)

vi.mock('@vueuse/core', () => ({
  useElementSize: () => ({ height: { value: 0 } })
}))

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  Button: { template: '<button><slot /></button>' },
  Badge: { template: '<span><slot /></span>' },
  Card: { template: '<div><slot /></div>' },
  CardHeader: { template: '<div><slot /></div>' },
  CardContent: { template: '<div><slot /></div>' },
  SessionCard: { props: ['title'], template: '<div class="session-card">{{ title }}</div>' },
  CenterFormationCard: {
    props: ['title'],
    template: '<div class="similaire-card">{{ title }}</div>'
  },
  CtaBanner: { template: '<div><slot /></div>' },
  SearchInput: {
    props: ['modelValue'],
    emits: ['update:modelValue', 'submit'],
    template: '<button class="search-stub" @click="$emit(\'submit\', \'caces\')" />'
  },
  IconDownload: true,
  IconCheck: true,
  IconAward: true,
  IconChevronRight: true,
  IconFileOff: true,
  IconRefresh: true,
  IconSparkle: true
}

const validParams = {
  famille: 'caces-conduite-engins',
  slug: 'caces-r489-chariots-elevateurs'
}

// useContentSeo reçoit désormais des getters réactifs : on les résout pour les assertions.
function seoArgs() {
  const [source, fallback] = seoMock.mock.calls[0]!
  const resolve = (v: unknown) => (typeof v === 'function' ? (v as () => unknown)() : v)
  return [resolve(source), resolve(fallback)] as const
}

async function mountPage() {
  const Host = defineComponent({
    render() {
      return h(Suspense, () => h(FormationPage))
    }
  })
  const wrapper = mount(Host, { global: { components: { LoadError, NotFound }, stubs } })
  await flushPromises()
  return wrapper
}

describe('pages/formations/[famille]/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    forceError = null
    routeMock = {
      params: { ...validParams },
      query: {},
      path: `/formations/${validParams.famille}/${validParams.slug}`,
      meta: {}
    }
  })

  it('affiche la fiche CACES R489 pour les bons paramètres', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('CACES R489 — Conduite de chariots élévateurs')
    expect(wrapper.text()).toContain('À propos de cette formation')
    expect(wrapper.text()).toContain('Prochaines sessions')
    expect(wrapper.findAll('.session-card')).toHaveLength(3)
    expect(wrapper.findAll('.similaire-card')).toHaveLength(3)
    expect(wrapper.text()).toContain('Sessions dès le 12 sept.')
  })

  it('définit le SEO et le JSON-LD Course', async () => {
    await mountPage()

    const [source, fallback] = seoArgs()
    expect(source).toEqual(
      expect.objectContaining({
        seo_title: 'CACES R489 — Conduite de chariots élevateurs'
      })
    )
    expect(fallback).toBe('CACES R489 — Conduite de chariots élevateurs')
    const ldJson = headMock.mock.calls[0]![0].script[0].innerHTML
    expect(JSON.parse(ldJson)['@type']).toBe('Course')
  })

  it('affiche l’état indisponible et adapte breadcrumb/SEO pour un slug inconnu', async () => {
    routeMock.params.slug = 'inconnu'
    routeMock.path = `/formations/${validParams.famille}/inconnu`
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain("Cette formation n'est pas disponible.")
    expect(routeMock.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Formations', to: '/formations' },
      { label: 'Formation indisponible' }
    ])
    const [source, fallback] = seoArgs()
    expect(source).toEqual(
      expect.objectContaining({ seo_title: 'Formation indisponible', seo_noindex: true })
    )
    expect(fallback).toBe('Formation indisponible')
  })

  it('affiche l’état indisponible pour une famille inconnue', async () => {
    routeMock.params.famille = 'inconnue'
    routeMock.path = '/formations/inconnue/caces-r489-chariots-elevateurs'
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain("Cette formation n'est pas disponible.")
  })

  it('affiche l’état erreur quand le chargement échoue', async () => {
    routeMock.query = { error: '1' }
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain("Le contenu n'a pas pu être chargé.")
    expect(routeMock.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Formations', to: '/formations' },
      { label: 'Erreur de chargement' }
    ])
    const [source, fallback] = seoArgs()
    expect(source).toEqual(
      expect.objectContaining({ seo_title: 'Erreur de chargement', seo_noindex: true })
    )
    expect(fallback).toBe('Erreur de chargement')
  })

  it('« Réessayer » retire le paramètre ?error=1 au lieu de relancer un appel voué à échouer', async () => {
    routeMock.query = { error: '1', autre: 'x' }
    const wrapper = await mountPage()

    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Réessayer'))!
      .trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith({
      path: routeMock.path,
      query: { autre: 'x' }
    })
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('« Réessayer » relance le chargement quand l’erreur ne vient pas du paramètre de simulation', async () => {
    forceError = new Error('API down')
    const wrapper = await mountPage()

    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Réessayer'))!
      .trigger('click')

    expect(refreshMock).toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('la recherche de l’état indisponible redirige vers /formations avec la requête', async () => {
    routeMock.params.slug = 'inconnu'
    routeMock.path = `/formations/${validParams.famille}/inconnu`
    const wrapper = await mountPage()

    await wrapper.find('.search-stub').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/formations',
      query: { q: 'caces' }
    })
  })
})
