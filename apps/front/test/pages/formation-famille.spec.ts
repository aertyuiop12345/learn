import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref, Suspense, watch, watchEffect } from 'vue'
import LoadError from '~/components/ErrorState/LoadError.vue'
import NotFound from '~/components/ErrorState/NotFound.vue'
import FamillePage from '~/pages/formations/[famille]/index.vue'

const navigateToMock = vi.fn()
const refreshMock = vi.fn()
const setResponseStatusMock = vi.fn()
const seoMock = vi.fn()

interface RouteMock {
  params: { famille: string }
  query: Record<string, string>
  path: string
  meta: Record<string, unknown>
}

let routeMock: RouteMock
let forceError: Error | null = null

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('watch', watch)
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
vi.stubGlobal('navigateTo', navigateToMock)

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  Button: { template: '<button><slot /></button>' },
  Badge: { template: '<span><slot /></span>' },
  Select: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<button><slot /></button>' },
  SelectContent: { template: '<div><slot /></div>' },
  SelectItem: { props: ['value'], template: '<span><slot /></span>' },
  CenterFormationCard: {
    props: ['title', 'family'],
    template: '<div class="formation-card">{{ family }} — {{ title }}</div>'
  },
  CtaBanner: { template: '<div><slot /></div>' },
  SearchInput: {
    props: ['modelValue'],
    emits: ['update:modelValue', 'submit'],
    template: '<button class="search-stub" @click="$emit(\'submit\', \'caces\')" />'
  },
  IconSearchMinus: true,
  IconFileOff: true,
  IconRefresh: true,
  IconSparkle: true
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
      return h(Suspense, () => h(FamillePage))
    }
  })
  const wrapper = mount(Host, { global: { components: { LoadError, NotFound }, stubs } })
  await flushPromises()
  return wrapper
}

describe('pages/formations/[famille]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    forceError = null
    routeMock = {
      params: { famille: 'caces-conduite-engins' },
      query: {},
      path: '/formations/caces-conduite-engins',
      meta: {}
    }
  })

  it('affiche la famille et le breadcrumb par défaut pour un slug connu', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain("CACES® & conduite d'engins")
    expect(wrapper.text()).toContain("Parcourir par type d'engin")
    expect(wrapper.text()).toContain('Chariots & gerbeurs')
    expect(wrapper.text()).toContain('Qui est concerné ?')
    expect(routeMock.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Formations', to: '/formations' },
      { label: 'CACES & conduite d’engins' }
    ])
    const [source, fallback] = seoArgs()
    expect(source).toEqual(
      expect.objectContaining({
        seo_title: 'CACES & conduite d’engins — Formations | LEARN UP ACADEMY'
      })
    )
    expect(fallback).toBe('CACES & conduite d’engins — Formations | LEARN UP ACADEMY')
  })

  it('liste les formations de la famille avec leur sous-famille', async () => {
    const wrapper = await mountPage()

    const cards = wrapper.findAll('.formation-card')
    expect(cards).toHaveLength(6)
    expect(wrapper.text()).toContain('CACES R489 — chariots élévateurs')
    expect(wrapper.text()).toContain('CACES R490 — grues de chargement')
  })

  it('le bouton « Afficher les autres formations » révèle le reste de la liste', async () => {
    const wrapper = await mountPage()

    const moreButton = wrapper.findAll('button').find((b) => b.text().includes('autres'))!
    expect(moreButton.text()).toContain('2')
    await moreButton.trigger('click')

    expect(wrapper.findAll('.formation-card')).toHaveLength(8)
  })

  it('« Voir la sous-famille » filtre la liste sur la sous-famille', async () => {
    const wrapper = await mountPage()

    const subFamilyButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Voir la sous-famille →')!
    await subFamilyButton.trigger('click')
    await flushPromises()

    const cards = wrapper.findAll('.formation-card')
    expect(cards).toHaveLength(3)
    for (const card of cards) {
      expect(card.text()).toContain('Chariots & gerbeurs')
    }
  })

  it('affiche l’état introuvable et adapte breadcrumb/SEO pour un slug inconnu', async () => {
    routeMock.params.famille = 'famille-inconnue'
    routeMock.path = '/formations/famille-inconnue'
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain("Cette famille de formations n'est pas disponible.")
    expect(routeMock.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Formations', to: '/formations' },
      { label: 'Famille introuvable' }
    ])
    const [source, fallback] = seoArgs()
    expect(source).toEqual(
      expect.objectContaining({ seo_title: 'Famille introuvable', seo_noindex: true })
    )
    expect(fallback).toBe('Famille introuvable')
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
      .find((b) => b.text() === 'Réessayer')!
      .trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/formations/caces-conduite-engins',
      query: { autre: 'x' }
    })
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('« Réessayer » relance le chargement quand l’erreur ne vient pas du paramètre de simulation', async () => {
    forceError = new Error('API down')
    const wrapper = await mountPage()

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Réessayer')!
      .trigger('click')

    expect(refreshMock).toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('la recherche de l’état introuvable redirige vers /formations avec la requête', async () => {
    routeMock.params.famille = 'famille-inconnue'
    routeMock.path = '/formations/famille-inconnue'
    const wrapper = await mountPage()

    await wrapper.find('.search-stub').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/formations',
      query: { q: 'caces' }
    })
  })
})
