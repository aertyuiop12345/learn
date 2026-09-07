<template>
  <div>
    <p class="font-display text-3xl md:text-[38px] font-extrabold text-ink">
      {{ value }}<span v-if="unit" class="text-h4 align-baseline text-ink-muted">{{ unit }}</span>
    </p>
    <p class="mt-xs text-small md:text-body font-medium text-ink-muted leading-[18.2px]">
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string
  unit?: string
  label: string
}>()
</script>
