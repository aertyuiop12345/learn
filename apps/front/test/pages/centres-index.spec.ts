import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CentresPage from '~/pages/centres/index.vue'

const seoMock = vi.fn()

vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useContentSeo', seoMock)

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  Label: { template: '<label><slot /></label>' },
  Select: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<select class="dept-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
  },
  SelectTrigger: { template: '<span><slot /></span>' },
  SelectContent: { template: '<span><slot /></span>' },
  SelectItem: {
    props: ['value'],
    template: '<option :value="value"><slot /></option>'
  },
  SearchInput: {
    props: ['modelValue'],
    emits: ['update:modelValue', 'submit'],
    template:
      '<input class="city-search" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  Button: { template: '<button><slot /></button>' },
  CenterMap: true,
  CenterResultCard: {
    props: ['center', 'active'],
    emits: ['select'],
    template:
      '<div class="center-card" :data-active="active" @click="$emit(\'select\', center.id)">{{ center.name }}</div>'
  },
  IconList: true,
  IconMap: true
}

describe('pages/centres/index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les 5 centres du Val-de-Marne par défaut', () => {
    const wrapper = mount(CentresPage, { global: { stubs } })

    expect(wrapper.text()).toContain('Réseau de centres')
    expect(wrapper.findAll('.center-card')).toHaveLength(5)
    expect(wrapper.text()).toContain('Val-de-Marne')
    // Le premier centre est actif par défaut (watch immediate).
    expect(wrapper.find('.center-card').attributes('data-active')).toBe('true')
  })

  it('filtre les centres par la recherche ville/code postal', async () => {
    const wrapper = mount(CentresPage, { global: { stubs } })

    await wrapper.find('.city-search').setValue('vitry')

    const cards = wrapper.findAll('.center-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]!.text()).toContain('Vitry-sur-Seine')
  })

  it('affiche l’état vide pour un département sans centre', async () => {
    const wrapper = mount(CentresPage, { global: { stubs } })

    await wrapper.find('.dept-select').setValue('48')

    expect(wrapper.findAll('.center-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('Aucun centre en')
    expect(wrapper.text()).toContain('Lozère')
    expect(wrapper.text()).toContain("Aucun centre n'est implanté dans ce département")
  })

  it('la recherche est réinitialisée au changement de département', async () => {
    const wrapper = mount(CentresPage, { global: { stubs } })

    await wrapper.find('.city-search').setValue('vitry')
    expect(wrapper.findAll('.center-card')).toHaveLength(1)

    await wrapper.find('.dept-select').setValue('48')
    await wrapper.find('.dept-select').setValue('94')

    expect(wrapper.findAll('.center-card')).toHaveLength(5)
  })

  it('un clic sur une carte active/désactive le centre', async () => {
    const wrapper = mount(CentresPage, { global: { stubs } })

    const first = wrapper.find('.center-card')
    expect(first.attributes('data-active')).toBe('true')

    await first.trigger('click')
    expect(first.attributes('data-active')).toBe('false')

    await first.trigger('click')
    expect(first.attributes('data-active')).toBe('true')
  })

  it('définit le SEO de la page réseau', () => {
    mount(CentresPage, { global: { stubs } })

    expect(seoMock).toHaveBeenCalledWith(
      expect.objectContaining({ seo_title: 'Réseau de centres — LEARN UP ACADEMY' }),
      'Réseau de centres — LEARN UP ACADEMY'
    )
  })
})
