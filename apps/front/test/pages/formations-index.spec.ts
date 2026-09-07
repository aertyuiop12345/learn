import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref, Suspense } from 'vue'
import { staticCatalog } from '~/composables/useCatalog'
import FormationsPage from '~/pages/formations/index.vue'

const seoMock = vi.fn()

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useContentSeo', seoMock)

// useCatalog est importé directement par la page : on stubbe les globals
// Nuxt qu'il consomme pour retourner le catalogue statique.
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '' } }))
vi.stubGlobal('useAsyncData', async () => ({
  data: ref({ formations: staticCatalog }),
  pending: ref(false),
  error: ref(null)
}))
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('logServerError', vi.fn())
let routeQuery: Record<string, string> = {}
vi.stubGlobal('useRoute', () => ({ query: routeQuery }))

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  Button: { template: '<button><slot /></button>' },
  Label: { template: '<label><slot /></label>' },
  SearchInput: {
    props: ['modelValue'],
    emits: ['update:modelValue', 'submit'],
    template:
      '<span><input class="catalogue-search" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><button class="search-go" @click="$emit(\'submit\', modelValue)" /></span>'
  },
  Select: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<span><slot /></span>' },
  SelectContent: { template: '<span><slot /></span>' },
  SelectItem: { props: ['value'], template: '<span><slot /></span>' },
  CatalogueFilters: true,
  CenterFormationCard: {
    props: ['title'],
    template: '<div class="formation-card">{{ title }}</div>'
  },
  Pagination: { template: '<nav><slot /></nav>' },
  PaginationContent: { template: '<span><slot :items="[]" /></span>' },
  PaginationPrevious: true,
  PaginationItem: true,
  PaginationEllipsis: true,
  PaginationNext: true,
  CtaBanner: { template: '<div><slot /></div>' },
  IconSparkle: true,
  IconFilter: true,
  IconClose: true,
  IconSearchMinus: true
}

async function mountPage() {
  const Host = defineComponent({
    render() {
      return h(Suspense, () => h(FormationsPage))
    }
  })
  const wrapper = mount(Host, { global: { stubs } })
  await flushPromises()
  return wrapper
}

describe('pages/formations/index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeQuery = {}
  })

  it('affiche le catalogue statique complet', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Trouvez la formation adaptée')
    expect(wrapper.findAll('.formation-card')).toHaveLength(staticCatalog.length)
    expect(wrapper.text()).toContain(`${staticCatalog.length} formations`)
  })

  it('filtre les formations par la recherche', async () => {
    const wrapper = await mountPage()

    await wrapper.find('.catalogue-search').setValue('sst')
    await wrapper.find('.search-go').trigger('click')

    const cards = wrapper.findAll('.formation-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]!.text()).toContain('SST')
    expect(wrapper.text()).toContain('1 formation')
  })

  it('affiche l’état vide quand aucune formation ne correspond', async () => {
    const wrapper = await mountPage()

    await wrapper.find('.catalogue-search').setValue('zzzzzz')

    expect(wrapper.findAll('.formation-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('Aucune formation ne correspond exactement')
  })

  it('« Réinitialiser les filtres » restaure le catalogue complet', async () => {
    const wrapper = await mountPage()

    await wrapper.find('.catalogue-search').setValue('zzzzzz')
    expect(wrapper.findAll('.formation-card')).toHaveLength(0)

    const reset = wrapper.findAll('button').find((b) => b.text() === 'Réinitialiser les filtres')
    await reset!.trigger('click')

    expect(wrapper.findAll('.formation-card')).toHaveLength(staticCatalog.length)
  })

  it('hydrate la recherche depuis ?q= (liens des états introuvable/erreur)', async () => {
    routeQuery = { q: 'sst' }
    const wrapper = await mountPage()

    const cards = wrapper.findAll('.formation-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]!.text()).toContain('SST')
  })

  it('définit le SEO du catalogue', async () => {
    await mountPage()

    expect(seoMock).toHaveBeenCalledWith(
      expect.objectContaining({ seo_title: 'Catalogue de formations — LEARN UP ACADEMY' }),
      'Catalogue de formations — LEARN UP ACADEMY'
    )
  })
})
