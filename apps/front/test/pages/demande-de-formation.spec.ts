import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, onMounted, reactive, watchEffect } from 'vue'
import DemandePage from '~/pages/centres/demande-de-formation.vue'

const seoMock = vi.fn()

vi.stubGlobal('reactive', reactive)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watchEffect', watchEffect)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useContentSeo', seoMock)

const routeStub = {
  query: {} as Record<string, string>,
  meta: {} as { breadcrumb?: unknown }
}
vi.stubGlobal('useRoute', () => routeStub)

const stubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  Button: { template: '<button><slot /></button>' },
  Card: { template: '<div><slot /></div>' },
  Input: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  Textarea: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  Label: { template: '<label><slot /></label>' },
  Select: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<button type="button"><slot /></button>' },
  SelectContent: { template: '<div><slot /></div>' },
  SelectItem: { props: ['value'], template: '<span><slot /></span>' },
  SelectValue: { props: ['placeholder'], template: '<span>{{ placeholder }}</span>' },
  Checkbox: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<button type="button" role="checkbox" @click="$emit(\'update:modelValue\', !modelValue)" />'
  },
  IconCheck: true,
  IconMapPin: true,
  IconBook: true,
  IconCalendar: true
}

function mountPage() {
  return mount(DemandePage, { global: { stubs } })
}

describe('pages/centres/demande-de-formation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeStub.query = {}
    routeStub.meta = {}
    window.sessionStorage.clear()
  })

  it('affiche le titre, le stepper et les trois sections du formulaire', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Demande de formation')
    expect(wrapper.text()).toContain('Votre besoin')
    expect(wrapper.text()).toContain('Votre entreprise')
    expect(wrapper.text()).toContain('Vos coordonnées')
    expect(wrapper.find('ol[aria-label="Progression"]').exists()).toBe(true)
  })

  it('affiche les champs du formulaire avec leurs labels', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Salariés à former')
    expect(wrapper.text()).toContain('Échéance souhaitée')
    expect(wrapper.text()).toContain('Précisions')
    expect(wrapper.text()).toContain('Raison sociale')
    expect(wrapper.text()).toContain('SIRET')
    expect(wrapper.text()).toContain('Nom et prénom')
    expect(wrapper.text()).toContain('Fonction')
    expect(wrapper.text()).toContain('E-mail professionnel')
    expect(wrapper.text()).toContain('Téléphone')
    expect(wrapper.text()).toContain('Politique de confidentialité')
  })

  it('affiche le contexte de la demande dans la sidebar', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Votre demande concerne')
    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(wrapper.text()).toContain("vous n'avez rien à ressaisir")
  })

  it('affiche le nom du centre transmis en query param', () => {
    routeStub.query = { centre: 'creteil' }
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(routeStub.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Centres', to: '/centres' },
      { label: 'Centre de Créteil', to: '/centres/creteil' },
      { label: 'Demande de formation' }
    ])
  })

  it("n'affiche que le bloc centre sans paramètres (RG04)", () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(wrapper.text()).not.toContain('CACES R489')
    expect(wrapper.text()).not.toContain('Session du')
  })

  it('affiche centre + formation quand les deux slugs sont transmis', () => {
    routeStub.query = { centre: 'creteil', formation: 'caces-r489-chariots-elevateurs' }
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(wrapper.text()).toContain('CACES R489 — chariots élévateurs')
    expect(wrapper.text()).not.toContain('Session du')
  })

  it('affiche les 3 blocs quand centre + formation + session sont transmis', () => {
    routeStub.query = {
      centre: 'creteil',
      formation: 'caces-r489-chariots-elevateurs',
      session: 'r489-cat3-creteil-2026-09-12'
    }
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(wrapper.text()).toContain('CACES R489 — chariots élévateurs')
    expect(wrapper.text()).toContain('Session du 12 septembre 2026')
  })

  it('affiche un libellé générique pour un slug formation inconnu', () => {
    routeStub.query = { formation: 'formation-inconnue' }
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Formation du catalogue')
  })

  it("le lien Modifier renvoie au point d'origine selon le niveau transmis", () => {
    routeStub.query = { centre: 'creteil' }
    let wrapper = mountPage()
    expect(wrapper.find('aside a').attributes('href')).toBe('/centres/creteil')

    routeStub.query = {
      centre: 'creteil',
      formation: 'caces-r489-chariots-elevateurs',
      famille: 'caces-conduite-engins'
    }
    wrapper = mountPage()
    expect(wrapper.find('aside a').attributes('href')).toBe(
      '/formations/caces-conduite-engins/caces-r489-chariots-elevateurs'
    )

    routeStub.query = {
      centre: 'creteil',
      formation: 'caces-r489-chariots-elevateurs',
      session: 'r489-cat3-creteil-2026-09-12',
      famille: 'caces-conduite-engins'
    }
    wrapper = mountPage()
    expect(wrapper.find('aside a').attributes('href')).toBe(
      '/formations/caces-conduite-engins/caces-r489-chariots-elevateurs#sessions'
    )
  })

  it('sauvegarde la saisie au clic sur Modifier et la restaure au retour', async () => {
    const wrapper = mountPage()
    await wrapper.find('form input').setValue('12')

    await wrapper.find('aside a').trigger('click')
    expect(window.sessionStorage.getItem('demande-formation-draft')).toContain('"salaries":"12"')

    const wrapper2 = mountPage()
    await nextTick()
    expect((wrapper2.find('form input').element as HTMLInputElement).value).toBe('12')
  })

  it("efface le brouillon à l'envoi du formulaire", async () => {
    window.sessionStorage.setItem('demande-formation-draft', '{"salaries":5,"consentement":true}')
    const wrapper = mountPage()
    await nextTick()

    await wrapper.find('form').trigger('submit.prevent')
    expect(window.sessionStorage.getItem('demande-formation-draft')).toBeNull()
  })

  it("bloque l'envoi tant que le consentement n'est pas donné", async () => {
    window.sessionStorage.setItem('demande-formation-draft', '{"salaries":5}')
    const wrapper = mountPage()

    await wrapper.find('form').trigger('submit.prevent')
    expect(window.sessionStorage.getItem('demande-formation-draft')).not.toBeNull()
  })

  it('prend la première valeur quand un query param est répété', () => {
    routeStub.query = { centre: ['creteil', 'autre'] as unknown as string }
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Centre de Créteil')
    expect(wrapper.find('aside a').attributes('href')).toBe('/centres/creteil')
  })

  it('affiche un breadcrumb générique sans contexte', () => {
    mountPage()

    expect(routeStub.meta.breadcrumb).toEqual([
      { label: 'Accueil', to: '/' },
      { label: 'Centres', to: '/centres' },
      { label: 'Demande de formation' }
    ])
  })

  it('applique le SEO de la page', () => {
    mountPage()

    expect(seoMock).toHaveBeenCalledWith(
      expect.objectContaining({ seo_title: 'Demande de formation | LEARN UP ACADEMY' }),
      'Demande de formation'
    )
  })

  it('le formulaire se soumet sans recharger la page', async () => {
    const wrapper = mountPage()

    await wrapper.find('form').trigger('submit.prevent')
    // Pas d'erreur ni de navigation — l'envoi est simulé côté maquette.
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
