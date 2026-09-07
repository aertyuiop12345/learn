import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '~/pages/index.vue'

const seoMock = vi.fn()
const headMock = vi.fn()

vi.stubGlobal('useContentSeo', seoMock)
vi.stubGlobal('useHead', headMock)

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  SearchInput: true,
  NetworkCard: { props: ['title'], template: '<div class="network-card">{{ title }}</div>' },
  FormationCard: { props: ['title'], template: '<div class="formation-card">{{ title }}</div>' },
  CenterCard: { props: ['name'], template: '<div class="center-card">{{ name }}</div>' },
  ConfierCard: { props: ['title'], template: '<div class="confier-card">{{ title }}</div>' },
  StatItem: {
    props: ['value', 'label'],
    template: '<div class="stat">{{ value }} {{ label }}</div>'
  },
  TestimonialCard: { props: ['author'], template: '<div class="testimonial">{{ author }}</div>' },
  ArticleCard: { props: ['title'], template: '<div class="article">{{ title }}</div>' },
  IconSparkle: true,
  IconSearch: true
}

describe('pages/index', () => {
  it('affiche le hero et les sections principales', () => {
    const wrapper = mount(HomePage, { global: { stubs } })

    expect(wrapper.text()).toContain('orchestrés')
    expect(wrapper.text()).toContain('Construisons ensemble le réseau Learn Up Academy')
    expect(wrapper.text()).toContain('Comment ça marche')
    expect(wrapper.text()).toContain('Nos formations')
    expect(wrapper.text()).toContain('Le réseau Learn Up Academy')
    expect(wrapper.text()).toContain('Confier mes formations')
    expect(wrapper.text()).toContain("Ce qu'en disent les entreprises")
    expect(wrapper.text()).toContain('Actualités')
  })

  it('rend les cartes réseau, formations, centres et articles', () => {
    const wrapper = mount(HomePage, { global: { stubs } })

    expect(wrapper.findAll('.network-card')).toHaveLength(3)
    expect(wrapper.findAll('.formation-card')).toHaveLength(4)
    expect(wrapper.findAll('.center-card')).toHaveLength(2)
    expect(wrapper.findAll('.confier-card')).toHaveLength(3)
    expect(wrapper.findAll('.stat')).toHaveLength(4)
    expect(wrapper.findAll('.testimonial')).toHaveLength(3)
    expect(wrapper.findAll('.article')).toHaveLength(3)
  })

  it('définit le SEO et le JSON-LD', () => {
    mount(HomePage, { global: { stubs } })

    expect(seoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        seo_title: 'LEARN UP ACADEMY — Plateforme de conseil en formation professionnelle'
      }),
      'LEARN UP ACADEMY'
    )
    expect(headMock).toHaveBeenCalledWith(expect.objectContaining({ script: expect.any(Array) }))
    const ldJson = headMock.mock.calls[0]![0].script[0].innerHTML
    expect(JSON.parse(ldJson)['@graph']).toHaveLength(2)
  })
})
