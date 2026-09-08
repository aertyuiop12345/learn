<template>
  <div
    :class="[
      'flex h-control items-center gap-sm rounded-full border border-outline bg-paper pl-md pr-sm shadow-sm focus-within:ring-2 focus-within:ring-outline',
      $attrs.class as string
    ]"
  >
    <slot name="icon" />
    <label :for="inputId" class="sr-only">{{ srLabel }}</label>
    <Input
      :id="inputId"
      :model-value="draft"
      :type="type"
      :placeholder="placeholder"
      class="h-auto flex-1 border-0 bg-transparent px-0 text-small text-ink shadow-none placeholder:text-ink-placeholder focus-visible:ring-0"
      @update:model-value="onInput"
      @keydown.enter="submit"
    />
    <button
      v-if="draft"
      type="button"
      class="flex h-lg w-lg shrink-0 items-center justify-center rounded-full text-ink-subtle transition hover:bg-surface hover:text-ink"
      :aria-label="clearLabel"
      @click="clear"
    >
      <IconClose :size="14" />
    </button>
    <Button
      type="button"
      size="icon"
      :aria-label="buttonLabel"
      class="h-8 w-8 shrink-0 rounded-full bg-primary text-paper hover:bg-primary-dark"
      @click="submit"
    >
      <IconSearch :size="16" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    inputId: string
    srLabel: string
    placeholder?: string
    buttonLabel?: string
    clearLabel?: string
    type?: string
  }>(),
  {
    modelValue: '',
    placeholder: '',
    buttonLabel: 'Rechercher',
    clearLabel: 'Effacer la recherche',
    type: 'text'
  }
)

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const draft = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value
  }
)

function onInput(value: string | number) {
  draft.value = String(value)
}

function submit() {
  emit('update:modelValue', draft.value)
  emit('submit', draft.value)
}

function clear() {
  draft.value = ''
  emit('update:modelValue', '')
  emit('submit', '')
}
</script>
