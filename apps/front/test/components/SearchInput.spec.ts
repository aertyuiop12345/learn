import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SearchInput from '~/components/ui/search-input/SearchInput.vue'

const InputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input class="search-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
}

function mountInput(props: Record<string, unknown> = {}) {
  return mount(SearchInput, {
    props: { inputId: 'test-search', srLabel: 'Rechercher', ...props },
    global: {
      stubs: {
        Input: InputStub,
        Button: { template: '<button><slot /></button>' },
        IconClose: { template: '<span />' },
        IconSearch: { template: '<span />' }
      }
    }
  })
}

describe('SearchInput', () => {
  it('n’émet pas update:modelValue pendant la saisie', async () => {
    const wrapper = mountInput()

    await wrapper.find('.search-input').setValue('caces')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('émet update:modelValue et submit à la touche Entrée', async () => {
    const wrapper = mountInput()

    await wrapper.find('.search-input').setValue('caces')
    await wrapper.find('.search-input').trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue')).toEqual([['caces']])
    expect(wrapper.emitted('submit')).toEqual([['caces']])
  })

  it('émet submit au clic sur le bouton de recherche', async () => {
    const wrapper = mountInput({ modelValue: 'sst' })

    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1]!.trigger('click')

    expect(wrapper.emitted('submit')).toEqual([['sst']])
  })

  it('vide la recherche et émet submit vide au clic sur effacer', async () => {
    const wrapper = mountInput({ modelValue: 'sst' })

    const clearButton = wrapper.find('button[aria-label="Effacer la recherche"]')
    expect(clearButton.exists()).toBe(true)
    await clearButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.emitted('submit')).toEqual([['']])
  })

  it('se resynchronise quand modelValue change de l’extérieur', async () => {
    const wrapper = mountInput({ modelValue: 'sst' })

    await wrapper.setProps({ modelValue: '' })

    expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('')
  })
})
